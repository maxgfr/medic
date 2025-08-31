# Système de Protection Admin Sécurisé

## Vue d'ensemble

Le système de protection admin utilise une authentification côté serveur avec des **cookies HTTP-only** et des **tokens JWT** pour sécuriser l'accès aux pages d'administration. Cette approche élimine les failles de sécurité côté client.

## Sécurité

### ⚠️ Faille Corrigée

La version précédente utilisait `sessionStorage` côté client, permettant à n'importe qui d'exécuter :

```javascript
sessionStorage.setItem("admin_authenticated", "true");
```

### ✅ Solution Sécurisée

- **Cookies HTTP-only** : Inaccessibles via JavaScript côté client
- **Tokens JWT signés** : Impossibles à falsifier sans la clé secrète
- **Vérification serveur** : Toute authentification validée côté serveur
- **Expiration automatique** : Tokens valides 2 heures maximum

## Configuration

### 1. Variables d'environnement

Ajouter ces variables dans votre fichier `.env.local` :

```bash
ADMIN_ACCESS_CODE="votre-code-secret-ici"
ADMIN_JWT_SECRET="votre-cle-jwt-super-secrete-ici"
```

⚠️ **Important** :

- Choisissez un code d'accès sécurisé
- Utilisez une clé JWT longue et complexe (minimum 32 caractères)
- Gardez ces valeurs confidentiellesection Admin

## Vue d'ensemble

Le système de protection admin permet de sécuriser l'accès aux pages d'administration avec un code d'accès configé dans les variables d'environnement.

## Configuration

### 1. Variable d'environnement

Ajouter la variable `ADMIN_ACCESS_CODE` dans votre fichier `.env.local` :

```bash
ADMIN_ACCESS_CODE="votre-code-secret-ici"
```

⚠️ **Important** : Choisissez un code sécurisé et gardez-le confidentiel.

### 2. Pages protégées

Toutes les pages sous `/admin/*` sont automatiquement protégées par le layout admin :

- `/admin/cabinet-validation` - Validation des cabinets
- `/admin/doctor-validation` - Validation des médecins

## Fonctionnement

### 1. Accès initial

- L'utilisateur accède à une page admin (ex: `/admin/cabinet-validation`)
- Une page de connexion s'affiche demandant le code d'accès
- Après saisie du bon code, l'accès est accordé

### 2. Session

- L'authentification est stockée dans `sessionStorage`
- L'utilisateur reste connecté pendant sa session navigateur
- Un bouton "Déconnexion" permet de sortir du mode admin

### 3. Interface admin

- Une barre bleue en haut indique le "Mode Administrateur"
- Bouton de déconnexion disponible dans cette barre

## Sécurité

### Côté serveur

- Vérification du code via API route `/api/admin/verify-access`
- Code d'accès stocké en variable d'environnement serveur
- Validation stricte du format de la requête

### Côté client

- Protection par composant `AdminAccessGuard`
- Session locale (pas de stockage permanent)
- Interface claire pour la déconnexion

## Structure des fichiers

```
src/
├── components/
│   └── admin-access-guard.tsx     # Composant de protection
├── app/
│   ├── (dashboard)/
│   │   └── admin/
│   │       ├── layout.tsx         # Layout protégé
│   │       ├── cabinet-validation/
│   │       └── doctor-validation/
│   └── api/
│       └── admin/
│           └── verify-access/
│               └── route.ts       # API de vérification
└── env.js                         # Configuration des variables d'env
```

## Utilisation

1. **Définir le code** : Ajouter `ADMIN_ACCESS_CODE` dans `.env.local`
2. **Accéder à l'admin** : Naviguer vers `/admin/cabinet-validation` ou `/admin/doctor-validation`
3. **Saisir le code** : Entrer le code d'accès configuré
4. **Utiliser l'interface** : Valider les comptes cabinets et médecins
5. **Se déconnecter** : Cliquer sur "Déconnexion" dans la barre admin

## Exemple d'utilisation

```bash
# Dans .env.local
ADMIN_ACCESS_CODE="MedicAdmin2024!"
```

Puis naviguer vers `http://localhost:3001/admin/cabinet-validation` et saisir le code "MedicAdmin2024!" pour accéder à l'interface d'administration.
