# Liberta — architecture, fonctionnement et déploiement

> Documentation technique basée sur l’état du code présent dans ce dépôt.
> Version observée : Next.js `16.3.5`, React `19.2.8`, MongoDB Driver `7.6.0`.

## 1. Résumé

Liberta est une plateforme publique de publication de témoignages et d’accusations nominatives. Elle permet de lire les contenus validés sans compte, de soumettre un contenu sans compte et de signaler un contenu. Une zone privée permet à un administrateur de modérer les publications et les signalements.

L’application n’est pas composée d’un frontend et d’un backend indépendants. Il s’agit d’une seule application Next.js qui regroupe :

- l’interface utilisateur rendue par l’App Router ;
- les mutations côté serveur via les Server Actions ;
- quelques endpoints HTTP via les Route Handlers ;
- la logique d’accès à MongoDB ;
- l’authentification de l’administrateur par cookie de session chiffré.

MongoDB Atlas est le service externe de persistance. Aucun compte utilisateur, adresse email ou adresse IP n’est nécessaire pour publier.

## 2. Architecture générale

```mermaid
flowchart TD
    V[Visiteur navigateur] -->|HTTPS| RP[Reverse proxy ou plateforme cloud]
    RP --> N[Serveur Next.js]

    N --> UI[App Router : pages et composants]
    N --> SA[Server Actions : publication, login, modération, signalement]
    N --> RH[Route Handlers : /feed.xml et /api/locale]
    SA --> AUTH[iron-session + Argon2id]
    SA --> DB[(MongoDB Atlas)]
    UI --> DB

    AUTH --> C[(Cookie httpOnly liberta_admin)]
    DB --> PUB[(publications)]
    DB --> REP[(reports)]
    DB --> LOG[(moderation_logs)]
```

### 2.1 Composants

| Composant | Rôle | Emplacement |
|---|---|---|
| App Router | Pages, layouts, erreurs et chargement | `app/` |
| Composants UI | Formulaires, listes, navigation et sections éditoriales | `components/`, `lib/*.tsx` |
| Couche métier/données | Publications, signalements, modération, session, traductions | `lib/` |
| Server Actions | Mutations déclenchées par les formulaires | `app/**/actions.ts` |
| Route Handlers | Réponses HTTP personnalisées | `app/**/route.ts` |
| MongoDB | Stockage permanent | MongoDB Atlas, base configurée par `MONGO_DB_NAME` |
| Reverse proxy | TLS, routage, limites de requêtes, rate limiting recommandé | Nginx, Caddy, Traefik ou plateforme cloud |

`next.config.ts` active `output: "standalone"`, ce qui permet de produire un paquet de production autonome pour un serveur Node ou une image Docker.

## 3. Arborescence utile

```text
app/
  page.tsx                         Accueil
  layout.tsx                       Layout racine et métadonnées
  publier/page.tsx                 Formulaire de publication
  publier/actions.ts               Server Action de création
  publications/page.tsx           Liste filtrable et paginée
  publications/[id]/page.tsx      Détail d’une publication publiée
  publications/[id]/report-actions.ts
                                   Server Action de signalement
  admin/login/page.tsx             Connexion administrateur
  admin/login/actions.ts           Vérification et création de session
  admin/moderation/page.tsx        File de modération
  admin/moderation/actions.ts     Publication, retrait, revue des signalements
  api/locale/route.ts              Choix de langue par cookie
  feed.xml/route.ts                Flux RSS public

components/                        Composants d’interface
lib/
  db.ts                            Connexion MongoDB réutilisée
  publications.ts                 Lecture publique des publications
  reports.ts                       Création et lecture des signalements
  admin-moderation.ts              Lecture et changement d’état admin
  moderation-log.ts                Journal des actions de modération
  admin-auth.ts                    Session et vérification Argon2id
  locale.ts, translations.ts       Langues FR/MG
public/                             Assets statiques
tests/db.test.mjs                  Tests unitaires de la connexion MongoDB
```

## 4. Routes et surfaces HTTP

| URL | Méthode | Accès | Fonction |
|---|---|---|---|
| `/` | GET | Public | Accueil, mission, aperçu et appel à publication |
| `/publier` | GET | Public | Formulaire de soumission sans compte |
| `/publications` | GET | Public | Publications publiées, recherche, filtre et pagination |
| `/publications/:id` | GET | Public | Détail d’une publication publiée |
| `/admin/login` | GET | Public | Formulaire de connexion admin |
| `/admin/moderation` | GET | Session admin | Publications en attente, signalements et historique |
| `/feed.xml` | GET | Public | RSS des publications validées, limité aux 50 plus récentes |
| `/api/locale?locale=fr\|mg&returnTo=/...` | GET | Public | Définit le cookie de langue puis redirige |

Les mutations ne sont pas exposées comme API REST classiques. Elles passent par des Server Actions Next.js attachées aux formulaires :

- `submitPublication` : crée une publication en `pending_review` ;
- `loginAdmin` : vérifie l’identifiant et le hash Argon2id puis crée la session ;
- `moderatePublication` : passe une publication à `published` ou `removed` ;
- `submitReport` : crée un signalement `pending` ;
- `reviewReport` : passe un signalement à `reviewed`.

## 5. Workflow fonctionnel

### 5.1 Publication par un visiteur

```text
Visiteur → /publier
        → choix du type et de la signature
        → validation serveur des champs
        → insertion MongoDB : pending_review
        → message de confirmation
        → visible publiquement uniquement après validation admin
```

Règles appliquées côté serveur :

- type obligatoire : `testimony` ou `named_accusation` ;
- titre : 5 à 160 caractères ;
- contenu : 30 à 10 000 caractères ;
- pseudonyme : 2 à 40 caractères si l’utilisateur ne choisit pas l’anonymat ;
- l’anonymat stocke `pseudonym: null` et `isAnonymous: true` ;
- aucune adresse IP n’est enregistrée par le code applicatif ;
- les deux types sont soumis à validation avant publication, et une accusation nominative n’est jamais publiée automatiquement.

### 5.2 Modération

1. L’administrateur ouvre `/admin/login`.
2. Le serveur compare `ADMIN_USERNAME` et le mot de passe avec le hash Argon2id.
3. Une session `iron-session` est enregistrée dans le cookie `liberta_admin`.
4. La session est valable au maximum 8 heures, avec `httpOnly`, `sameSite=strict` et `secure` en production.
5. `/admin/moderation` charge au maximum 100 publications `pending_review`, 100 signalements `pending` et 100 événements récents.
6. L’action admin vérifie à nouveau la session avant chaque mutation MongoDB.
7. Une publication devient `published` ou `removed`.
8. Chaque décision est inscrite dans `moderation_logs` avec l’utilisateur admin, la cible et la date.

La protection ne repose donc pas uniquement sur une redirection de page : les Server Actions appellent `requireAdmin()` avant d’écrire en base.

### 5.3 Signalement public

Depuis le détail d’une publication publiée, un visiteur peut choisir un motif et ajouter jusqu’à 1 000 caractères de précisions. Le serveur vérifie que la publication existe encore et est publiée, puis crée un document `reports` sans identité du visiteur.

Un signalement peut concerner une publication devenue indisponible ; il reste visible dans la file admin avec un message approprié. La revue passe son statut à `reviewed` et crée une entrée dans le journal.

## 6. Modèle de données MongoDB

Base par défaut : `liberta` (modifiable par `MONGO_DB_NAME`). Collections utilisées :

### `publications`

```json
{
  "_id": "ObjectId",
  "type": "testimony | named_accusation",
  "title": "string",
  "content": "string",
  "pseudonym": "string | null",
  "isAnonymous": "boolean",
  "status": "pending_review | published | removed",
  "createdAt": "Date",
  "publishedAt": "Date | null"
}
```

La lecture publique filtre toujours `status: "published"`. Le tri est descendant par `publishedAt`, puis `createdAt`, puis `_id`.

### `reports`

```json
{
  "_id": "ObjectId",
  "publicationId": "ObjectId",
  "reason": "Contenu inapproprié | Accusation non vérifiée | Donnée personnelle | Autre problème",
  "details": "string",
  "status": "pending | reviewed",
  "createdAt": "Date"
}
```

### `moderation_logs`

```json
{
  "_id": "ObjectId",
  "action": "publication_published | publication_removed | report_reviewed",
  "targetId": "ObjectId",
  "adminUsername": "string",
  "createdAt": "Date"
}
```

### Indexes recommandés avant montée en charge

Le code fonctionne sans migration, mais ces indexes sont recommandés dans MongoDB Atlas :

```javascript
db.publications.createIndex({ status: 1, publishedAt: -1, createdAt: -1 })
db.publications.createIndex({ status: 1, createdAt: 1 })
db.reports.createIndex({ status: 1, createdAt: 1 })
db.moderation_logs.createIndex({ createdAt: -1 })
```

La recherche publique utilise actuellement des expressions régulières sur `title`, `content` et `pseudonym`. Pour un gros volume, prévoir un index de recherche MongoDB Atlas Search ou une stratégie de recherche dédiée.

## 7. Variables d’environnement

Ne jamais commiter `.env`, `.env.local` ou les valeurs de production. Les variables sans préfixe `NEXT_PUBLIC_` restent côté serveur dans Next.js.

| Variable | Obligatoire | Usage |
|---|---:|---|
| `NEXT_TELEMETRY_DISABLED` | Non | Désactive la télémétrie Next.js ; valeur recommandée `1` |
| `MONGO_URI` | Oui | URI de connexion MongoDB Atlas |
| `MONGO_DB_NAME` | Non | Nom de base ; défaut `liberta` |
| `SITE_URL` | Recommandée | URL publique utilisée pour les liens RSS, par exemple `https://liberta.example.org` |
| `SESSION_PASSWORD` | Oui | Secret de session, au moins 32 caractères aléatoires |
| `ADMIN_USERNAME` | Oui | Identifiant admin |
| `ADMIN_PASSWORD_HASH_B64` | Oui | Hash Argon2id encodé en Base64 |

Exemple de fichier local :

```dotenv
NEXT_TELEMETRY_DISABLED=1
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGO_DB_NAME=liberta
SITE_URL=http://localhost:3000
SESSION_PASSWORD=remplacer-par-un-secret-aleatoire-de-32-caracteres-minimum
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH_B64=...
```

Générer le hash admin avec le package déjà installé :

```powershell
node -e "require('argon2').hash(process.argv[1], {type: require('argon2').argon2id}).then(console.log)" "MOT_DE_PASSE"
```

Puis encoder le hash Argon2id complet en Base64 avant de le mettre dans `ADMIN_PASSWORD_HASH_B64`. Éviter de placer un vrai mot de passe dans l’historique du shell ; pour la production, utiliser le gestionnaire de secrets de la plateforme.

Générer `SESSION_PASSWORD` avec un générateur cryptographiquement sûr, par exemple :

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

## 8. Pré-requis techniques

### Développement

- Node.js compatible avec Next.js 16 et les dépendances natives d’`argon2` ; utiliser de préférence une version LTS récente.
- npm et accès réseau pour installer les dépendances.
- MongoDB Atlas ou MongoDB local accessible depuis l’environnement.
- Navigateur moderne.
- Au minimum 2 Go de RAM pour une installation confortable avec compilation locale.

### Production minimale recommandée

Pour un lancement à faible trafic :

- 1 VM Linux 64 bits, 1 vCPU et 1 à 2 Go de RAM ; 2 vCPU et 4 Go de RAM sont préférables pour le build et la marge d’exploitation ;
- 20 Go de disque SSD ;
- Node.js LTS ;
- Nginx ou Caddy devant Next.js ;
- certificat TLS automatique ;
- MongoDB Atlas, avec sauvegardes et accès réseau restreint ;
- DNS contrôlé pour créer le sous-domaine ;
- sauvegarde/export régulier de la base et accès SSH restreint si VM.

Le disque applicatif ne doit pas être considéré comme la sauvegarde des publications. La base MongoDB et les secrets doivent être sauvegardés ou stockés séparément.

## 9. Déploiement recommandé sur un serveur Node.js

Cette méthode conserve toutes les fonctionnalités serveur. Le projet contient déjà les scripts `npm run build` et `npm run start`, ainsi que `output: "standalone"`.

### 9.1 Installation et configuration

```bash
git clone <URL_DU_DEPOT> liberta
cd liberta
npm ci
cp .env.example .env
# Renseigner les valeurs de production dans .env
npm run lint
npm run build
```

En production, `npm ci` installe les versions verrouillées par `package-lock.json`. Ne pas lancer `npm run dev` comme serveur public.

### 9.2 Démarrage standard

```bash
NODE_ENV=production npm run start
```

Le serveur écoute généralement sur le port `3000`. Le reverse proxy doit être le seul composant exposé publiquement et transférer vers `127.0.0.1:3000`.

### 9.3 Paquet standalone

Après `npm run build`, Next.js génère `.next/standalone/server.js`. Pour une installation standalone complète, transférer également les assets suivants :

```bash
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
```

Puis démarrer :

```bash
cd .next/standalone
NODE_ENV=production node server.js
```

Conserver les variables d’environnement au runtime du processus. Si plusieurs instances sont lancées, utiliser la même valeur de `SESSION_PASSWORD` et définir une clé stable `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` conformément à la documentation Next.js.

### 9.4 Exemple de service systemd

```ini
[Unit]
Description=Liberta Next.js
After=network.target

[Service]
Type=simple
User=liberta
WorkingDirectory=/opt/liberta/.next/standalone
EnvironmentFile=/etc/liberta/liberta.env
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /opt/liberta/.next/standalone/server.js
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Commandes usuelles :

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now liberta
sudo systemctl status liberta
sudo journalctl -u liberta -f
```

## 10. Sous-domaine du backend / de l’application

### 10.1 Ce qui est possible immédiatement

Le plus simple est de publier l’application complète sur un sous-domaine, par exemple :

```text
https://app.example.org
```

Le DNS peut être configuré ainsi :

```text
Type A      Nom app      IP_PUBLIQUE_DU_SERVEUR
```

ou, si l’hébergeur fournit un nom de cible :

```text
Type CNAME  Nom app      cible.hebergeur.example
```

Ensuite :

1. configurer le certificat TLS pour `app.example.org` ;
2. configurer Nginx/Caddy pour router ce nom vers Next.js sur `127.0.0.1:3000` ;
3. définir `SITE_URL=https://app.example.org` ;
4. vérifier `/`, `/publications`, `/publier`, `/feed.xml` et `/admin/login` ;
5. vérifier que les cookies admin sont envoyés uniquement en HTTPS.

### 10.2 Si le besoin est réellement un backend séparé

Le code actuel ne fournit pas une API backend indépendante avec des endpoints de publication et de modération documentés. Pour un découpage futur :

- conserver l’interface web sur `www.example.org` ;
- créer des Route Handlers `/api/...` ou un service backend séparé sur `api.example.org` ;
- définir explicitement l’authentification API, CORS, CSRF, rate limiting et validation des payloads ;
- migrer les Server Actions vers cette API uniquement si plusieurs clients doivent consommer le backend ;
- ne pas exposer `MONGO_URI` au navigateur ;
- conserver MongoDB dans un réseau autorisé uniquement pour les serveurs applicatifs.

Le sous-domaine seul ne transforme pas l’application en backend séparé : il change le point d’accès DNS, pas les frontières de code.

### 10.3 Exemple Nginx

```nginx
server {
    listen 80;
    server_name app.example.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.example.org;

    ssl_certificate     /etc/letsencrypt/live/app.example.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.example.org/privkey.pem;

    client_max_body_size 1m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
    }
}
```

Le reverse proxy doit aussi recevoir une configuration de rate limiting adaptée, en particulier sur `/publier`, `/admin/login` et les Server Actions. Le code indique que l’anti-spam reste à compléter.

## 11. Déploiement sur une plateforme Next.js managée

Une plateforme comme Vercel peut exécuter cette application car elle utilise le runtime serveur, MongoDB et des Server Actions. Procédure générale :

1. importer le dépôt ;
2. choisir Node.js et la commande de build par défaut `npm run build` ;
3. ajouter les variables listées à la section 7 dans l’environnement de production ;
4. autoriser les connexions réseau de la plateforme dans MongoDB Atlas ou utiliser une solution de réseau privé ;
5. associer le domaine ou sous-domaine ;
6. mettre `SITE_URL` sur l’URL publique finale ;
7. lancer les vérifications fonctionnelles et consulter les logs.

L’avantage est l’absence de gestion de VM, Nginx et certificats. Le point à vérifier est la compatibilité des limites de durée, du cache et du modèle d’exécution de la plateforme avec les Server Actions et la connexion MongoDB.

## 12. Sécurité et exploitation

### Obligatoire avant production

- Remplacer toutes les valeurs d’exemple de `.env.example`.
- Utiliser un secret de session aléatoire d’au moins 32 caractères.
- Stocker les secrets dans les variables sécurisées de l’hébergeur, jamais dans Git.
- Activer TLS et rediriger HTTP vers HTTPS.
- Restreindre MongoDB Atlas aux IP ou réseaux des serveurs autorisés.
- Créer un utilisateur MongoDB dédié avec les droits minimaux nécessaires.
- Activer les sauvegardes MongoDB Atlas.
- Vérifier que `ADMIN_PASSWORD_HASH_B64` contient uniquement un hash Argon2id valide.
- Protéger le serveur par firewall et limiter SSH à des clés, si une VM est utilisée.
- Ajouter un rate limiting côté reverse proxy ; l’anti-spam applicatif n’est pas encore implémenté.
- Surveiller les erreurs de connexion MongoDB, les échecs de login et la croissance des collections.

### Données personnelles et modération

Le système minimise les données, mais les contenus et pseudonymes restent des données utilisateur. Définir avant ouverture publique :

- une politique de conservation des publications retirées et des signalements ;
- une procédure de réponse aux demandes de retrait ;
- une politique de sauvegarde et de restauration ;
- les rôles et responsabilités des modérateurs ;
- une stratégie de rotation du compte admin et des secrets.

### Cache et cohérence

Les pages de publications, le détail et la modération déclarent `force-dynamic`. Le RSS est également dynamique avec un cache public de 5 minutes et `stale-while-revalidate` de 10 minutes. Ne pas mettre les pages admin derrière un cache public.

Une seule instance Node est la configuration la plus simple. En multi-instance, partager les secrets de session et la clé Server Actions, prévoir une stratégie de cache partagé si nécessaire et vérifier le support du streaming par le load balancer.

## 13. Vérification après déploiement

```bash
npm run lint
npm run build
```

Checklist HTTP :

- [ ] `GET /` répond en HTTPS.
- [ ] `GET /publications` répond même avec une base vide.
- [ ] Une publication valide arrive dans `pending_review`.
- [ ] Une publication ne devient publique qu’après action admin.
- [ ] Une publication `removed` n’est pas lisible publiquement.
- [ ] Le login admin redirige vers `/admin/moderation`.
- [ ] Un appel admin sans session échoue et ne modifie pas la base.
- [ ] Un signalement apparaît dans la file admin.
- [ ] `/feed.xml` contient uniquement les publications publiées et des liens basés sur `SITE_URL`.
- [ ] Le changement de langue ne permet pas une redirection externe.
- [ ] Les cookies admin ont `HttpOnly`, `Secure` en production et `SameSite=Strict`.
- [ ] Les logs ne contiennent ni mot de passe, ni URI MongoDB, ni contenu sensible inutile.

## 14. Limites connues et prochaines améliorations

- Il n’y a pas de script npm dédié aux tests ; les tests présents se lancent directement avec un runner Node compatible avec `tests/db.test.mjs`.
- L’anti-spam, le rate limiting applicatif et la détection d’abus restent à ajouter.
- La recherche par regex peut devenir coûteuse lorsque le volume augmente.
- Il n’existe pas de bouton de déconnexion visible dans la zone admin ; prévoir une action dédiée si nécessaire.
- Les erreurs serveur générales doivent être surveillées via la plateforme d’hébergement et MongoDB Atlas.
- Si un vrai backend public doit être consommé par une application mobile ou un autre frontend, formaliser une API versionnée et une politique CORS/authentification avant de séparer les déploiements.

## 15. Références internes

- Configuration de production : `next.config.ts`
- Variables d’exemple : `.env.example`
- Démarrage local et principes fonctionnels : `README.md`
- Connexion MongoDB : `lib/db.ts`
- Authentification admin : `lib/admin-auth.ts`
- Publications : `lib/publications.ts` et `app/publier/actions.ts`
- Modération : `lib/admin-moderation.ts` et `app/admin/moderation/actions.ts`
- Signalements : `lib/reports.ts` et `app/publications/[id]/report-actions.ts`
- Flux RSS : `app/feed.xml/route.ts`
