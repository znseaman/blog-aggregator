# Gator

A blog aggregator used to add RSS feeds for blogs and read the most recent posts for a blog.

## Table of Contents

- [About](#about)
- [Getting Started](#getting-started)
- [Usage](#usage)

## About

This project allows developers to read blog posts from their RSS feeds through the terminal.

The main features are:

- Adding RSS feeds
- Following / unfollowing existing RSS feeds
- Browsing the latest posts for following RSS feeds (ability to specify the limit to view)

This project was a guided project through [Boot.dev](https://www.boot.dev/) 🐻

## Getting Started

### Prerequisites

This package contains an .nvmrc for the Node.js version this project requires. I'd recommend installing [NVM](https://github.com/nvm-sh/nvm) manage Node.js versions. To use the specific version associated with this project, run `nvm use` from the root of this project. To verify the correct version of node has been activated, run `node --version`.

This project requires installing PostgreSQL 16. Below are the instructions to install and test that everything is working.

For Mac using brew:

```bash
brew install postgresql@16
```

For Linux / WSL (Debian):

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

To verify a successful installation:

```bash
psql --version
```

(Linux / WSL only) Update postgres password:

```bash
sudo passwd postgres
```

Starting the PostgreSQL server in the background:

- Mac: `brew services start postgresql@16`
- Linux / WSL: `sudo service postgresql start`

Connect to the server via the `psql` shell:

- Mac: `psql postgres`
- Linux / WSL: `sudo -u postgres psql`

Create a new database (the one below is called `gator`):

```bash
CREATE DATABASE gator;
```

Connect to new database:

```bash
\c gator
```

(Linux / WSL only) Set the user password:

```bash
ALTER USER postgres PASSWORD 'postgres';
```

Query the database to verify everything is working:

```bash
SELECT version();
```

### Installation

Step-by-step instructions to get the development environment running:

1. Clone the repo: `git clone https://github.com/znseaman/blog-aggregator`
2. `cd` into the repo directory
3. Install dependencies: `npm install`.
4. Create a `~/.gatorconfig.json` (a JSON stored at your home directory used keep track of the database url and current user logged in) in the following format:

```json
{
  "dbUrl": "<protocol://username:password@host:port/database>",
  "currentUserName": "<username>"
}
```

The following are dbURL examples depending on your operating system:

- Mac (no password, your username): `postgres://username:@localhost:5432/gator`
- Linux / WSL (password set, postgres user): `postgres://postgres:postgres@localhost:5432/gator`

Test connection string by running:

```bash
psql "postgres://username:@localhost:5432/gator"
```

## Usage

Show examples of how to run or use the project.

```bash
# Register user
npm start register <name>

# Login as user
# Sets current user to this user, so they can add feeds, follow, unfollow, browse
npm start login <name>

# Reset users database - ⚠️ removes all users from the database
npm start reset

# List users and show the current one
npm start users

# Aggregate RSS feeds and posts to the database
# <timeBetweenRequests>: "10ms", "10s", "5m", "5h" (accepts a number & a unit as a string)
npm start agg <timeBetweenRequests>

# Add RSS feed for the current user
# <name>: name of the RSS feed
# <url>: url of the RSS feed
npm start addfeed <name> <url>

# Follow an RSS feed as the current user
# <url>: url of the RSS feed to follow
npm start follow <url>

# List the RSS feeds the current user is following
npm start following

# Unfollow an RSS feed as the current user
# <url>: url of the RSS feed to unfollow
npm start unfollow <url>

# Browse most recent posts from all the RSS feeds the current user follows
# <limit>: number of posts | defaults to 2
npm start browse <limit>

```
