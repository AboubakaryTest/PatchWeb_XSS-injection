# 🛡️ PatchWeb : Audit, Exploitation et Sécurisation

Ce projet documente le cycle complet de vie d'un audit de sécurité informatique : de la découverte des failles (Red Team) à la correction, la refonte architecturale et le déploiement conteneurisé (Blue Team).

---

## 📑 Sommaire
1.  [Architecture du Projet](#1-architecture-du-projet)
2.  [Phase 1 : Audit et Exploitation (Red Team)](#2-phase-1--audit-et-exploitation-red-team)
3.  [Phase 2 : Sécurisation (Blue Team)](#3-phase-2--sécurisation-blue-team)
4.  [Phase 3 : Virtualisation Docker](#4-phase-3--virtualisation-docker)
5.  [Guide d'Installation](#5-guide-dinstallation)

---

## 1. Architecture du Projet

L'application est une démonstration technique ("Vulnerable by Design") composée de :
* **Backend :** Node.js (Express) + Base de données SQLite.
* **Frontend :** React.js.
* **Infrastructure :** Docker & Docker Compose.

### 🚨 Le Problème Initial
L'application souffrait d'un défaut de conception critique : **le Frontend envoyait directement des requêtes SQL brutes au Backend.**

* ❌ **Frontend :** `axios.post('/user', "SELECT * FROM users WHERE id = " + id)`
* ❌ **Backend :** `db.all(req.body)`

Le backend agissait comme un simple tunnel ("proxy") vers la base de données, sans aucune validation, permettant une manipulation totale par l'utilisateur.

---

## 2. Phase 1 : Audit et Exploitation (Red Team)

Lors de l'audit, trois vulnérabilités critiques (OWASP Top 10) ont été identifiées :

### A. Injection SQL (SQLi)
L'absence de validation permettait d'injecter du code SQL.
* **Vecteur :** Champ de recherche d'utilisateur.
* **Payload :** `1 OR 1=1`
* **Impact :** Exfiltration de l'intégralité de la base de données.

### B. Remote Code Execution (RCE) via SQL
Une route `/query` acceptait n'importe quelle instruction SQL en POST.
* **Payload :** `DROP TABLE users`
* **Impact :** Perte de données et Déni de Service (DoS).

---

## 3. Phase 2 : Sécurisation (Blue Team)

Une refonte complète du code a été appliquée pour respecter les standards de sécurité.

### 🔒 1. Backend : Requêtes Paramétrées
Nous avons banni la concaténation dynamique. Les entrées utilisateurs sont désormais traitées via des **placeholders (`?`)**. SQLite traite ces entrées strictement comme des données.

**Code Sécurisé (Après) :**
```javascript
// Le tableau [name, password] remplace les '?' de manière sécurisée
db.run(`INSERT INTO users (name, password) VALUES (?, ?)`, [name, password]);


## 🔒 2. Architecture : API REST Stricte

Le Frontend n'envoie plus jamais de SQL. Il envoie une intention via une URL REST.

Avant : POST /user avec corps SELECT...

Après : GET /user/:id

Validation : Le backend vérifie explicitement que :id est bien un nombre avant d'interroger la base.

## 🔒 3. Nettoyage (Sanitization)

Suppression définitive de la route /query.

Validation des types de données reçues (JSON uniquement).

## 4. Phase 3 : Virtualisation Docker
Pour garantir la portabilité et résoudre les problèmes de compatibilité (notamment sur les puces Apple Silicon M1/M2), l'application a été conteneurisée.

Architecture Docker Compose

Backend : Image node:18-alpine sur le port 8000.

Frontend : Image node:18-alpine sur le port 3000.

5. Guide d'Installation
Prérequis

Docker Desktop installé.

Git (optionnel).

