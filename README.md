# Liberta

Plateforme publique de liberté d’expression pour Madagascar. Le projet privilégie
la lecture sans compte, la publication anonyme et la collecte minimale de données.

## État du projet

La première étape met en place :

- une page d’accueil publique, légère et sans script tiers ;
- des métadonnées en français et une typographie système sans requête externe ;
- une configuration Next.js `standalone` pour l’auto-hébergement ;
- la désactivation de la télémétrie Next.js via `NEXT_TELEMETRY_DISABLED=1`.

La publication, la modération et le signalement public sont maintenant
disponibles. L’anti-spam reste une prochaine étape.

La lecture publique utilise maintenant MongoDB Atlas via le driver officiel
`mongodb`. Configurez `MONGO_URI` et `MONGO_DB_NAME` dans `.env.local` avant
d’ouvrir `/publications`.

Le flux RSS public est disponible sur `/feed.xml`. Configurez `SITE_URL` avec
l’URL publique du site pour que les liens du flux soient corrects. Le flux ne
contient que les publications déjà validées et ne demande aucune inscription.

## Démarrage

Copiez [`.env.example`](./.env.example) vers `.env.local`, puis lancez le serveur :

```sh
cp .env.example .env.local
npm run dev
```

Ouvrez http://localhost:3000.

Pour MongoDB Atlas, remplacez les valeurs fictives de `MONGO_URI` par votre
chaîne de connexion réelle. Dans Atlas, l’utilisateur doit avoir les droits
d’écriture sur la base `liberta` et l’adresse du serveur doit être autorisée
dans la liste réseau. Ne commitez jamais `.env.local`.

## Premier administrateur

L’accès de modération se trouve sur `/admin/login`. Il nécessite :

- `ADMIN_USERNAME` ;
- `ADMIN_PASSWORD_HASH_B64`, hash Argon2id encodé en Base64 pour `.env` ;
- `SESSION_PASSWORD`, une valeur aléatoire d’au moins 32 caractères.

Pour générer un hash Argon2id sans afficher le mot de passe dans le dépôt :

```sh
node -e "require('argon2').hash(process.argv[1], {type: require('argon2').argon2id}).then(console.log)" "VOTRE_MOT_DE_PASSE"
```

Encodez le hash Argon2id en Base64 avant de le placer dans
`ADMIN_PASSWORD_HASH_B64`, car les caractères `$` du format Argon2id peuvent
être interprétés par le chargeur de variables d’environnement.

La route de modération vérifie la session et l’autorisation au niveau de chaque
action MongoDB. Une publication approuvée devient `published`; une publication
refusée devient `removed`. Depuis la page détail d’une publication, tout visiteur
peut envoyer un signalement avec un motif et une précision facultative. Les
signalements sont conservés sans compte, email ni adresse IP, puis apparaissent
dans la file privée `/admin/moderation`.

## Vérification

```sh
npm run lint
NEXT_TELEMETRY_DISABLED=1 npm run build
```

## Principes non négociables

- aucune adresse IP stockée ;
- aucun script d’analytics ou service tiers qui voit les visiteurs ;
- aucun contenu utilisateur rendu sans assainissement ;
- aucune accusation nominative publiée automatiquement ;
- aucune protection de la modération par le middleware seul.
