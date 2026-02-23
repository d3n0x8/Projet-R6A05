# IUT Project — API REST Node.js / Hapi.js

Application API REST construite avec **Hapi.js**, permettant la gestion d'utilisateurs, d'une bibliothèque de films et d'une liste de films favoris, avec authentification JWT, notifications par mail et export CSV via RabbitMQ.

---

## Technologies

| Technologie | Rôle |
|---|---|
| **Hapi.js** | Framework HTTP |
| **Objection.js + Knex.js** | ORM et query builder |
| **MySQL** | Base de données (SQLite en test) |
| **@hapi/jwt** | Authentification JWT |
| **Nodemailer** | Envoi de mails |
| **Ethereal Email** | Service SMTP de test |
| **amqplib + RabbitMQ** | Message broker (export CSV asynchrone) |
| **Swagger** | Documentation interactive |

---

## Installation

```bash
git clone <url-du-repo>
cd iut-project
npm install
```

---

## Variables d'environnement

Copier `server/.env.example` en `server/.env` et renseigner les valeurs :

```dotenv
# Serveur
PORT=3000
NODE_ENV=development

# Base de données MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_DATABASE=user
DB_PORT=3306

# JWT
JWT_SECRET=une_cle_secrete_solide

# Mail — créer un compte sur https://ethereal.email/
MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USER=xxx@ethereal.email
MAIL_PASS=xxx
MAIL_FROM="IUT Project" <noreply@iut-project.com>

# RabbitMQ (optionnel, pour l'export CSV)
AMQP_URL=amqp://localhost
```

---

## Démarrage

**Prérequis :** MySQL en marche avec la base `user` créée.

```bash
# Lancer le serveur
npm start

# Tests (SQLite en mémoire, sans MySQL)
NODE_ENV=test npm test
```

Swagger disponible sur **http://localhost:3001/documentation**

Pour s'authentifier dans Swagger : se connecter via `POST /user/login`, copier le token et cliquer sur **Authorize** → saisir `Bearer <token>`.

### Passer un utilisateur en admin

```bash
docker exec hapi-mysql mysql -u root -phapi \
  -e "UPDATE \`user\`.\`user\` SET scope = '[\"user\",\"admin\"]' WHERE mail = 'votre@mail.com';"
```

---

## Routes

### Utilisateurs

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/user` | ❌ | Créer un utilisateur (+ mail de bienvenue) |
| POST | `/user/login` | ❌ | Se connecter → retourne un JWT |
| GET | `/users` | `user/admin` | Lister les utilisateurs |
| PATCH | `/user/{id}` | `admin` | Modifier un utilisateur |
| DELETE | `/user/{id}` | `admin` | Supprimer un utilisateur |

### Films

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/movie` | `admin` | Ajouter un film (+ notif mail à tous) |
| GET | `/movies` | `user/admin` | Lister les films |
| PATCH | `/movie/{id}` | `admin` | Modifier un film (+ notif mail aux favoris) |
| DELETE | `/movie/{id}` | `admin` | Supprimer un film |

### Favoris

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/movie/{id}/favorite` | `user/admin` | Ajouter un film en favoris |
| DELETE | `/movie/{id}/favorite` | `user/admin` | Retirer un film des favoris |

### Export

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/export/movies` | `admin` | Déclenche l'envoi du CSV par mail (via RabbitMQ) |

