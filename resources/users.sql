-- roles definition

CREATE TABLE roles (
    id       TEXT PRIMARY KEY COLLATE NOCASE,
    description text
);


-- roles2 definition

CREATE TABLE roles2 (
    id       TEXT PRIMARY KEY COLLATE NOCASE,
    description text
);


-- saved_sessions definition

CREATE TABLE saved_sessions (
    [key]     TEXT,
    timestamp TIMESTAMP,
    userId    INTEGER
);


-- users definition

CREATE TABLE users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT
);

CREATE UNIQUE INDEX username_idx ON users (
    username COLLATE NOCASE
);


-- password_reset_tokens definition

CREATE TABLE password_reset_tokens (
    userid  INTEGER   PRIMARY KEY,
    token   TEXT,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (
        userid
    )
    REFERENCES users (id) ON DELETE CASCADE
                          ON UPDATE NO ACTION
);


-- user_roles definition

CREATE TABLE user_roles (
	userid integer,
	roleid text,
	 FOREIGN KEY (
        userid
    )
    REFERENCES users (id) ON DELETE CASCADE
                          ON UPDATE NO ACTION,
 FOREIGN KEY (
        roleid
    )
    REFERENCES roles (id) ON DELETE CASCADE
                          ON UPDATE NO ACTION,
    PRIMARY KEY (
        userid,
        roleid
    )                         
                          
);


-- userinfo definition

CREATE TABLE userinfo (
    userid        INTEGER PRIMARY KEY,
    password      TEXT,
    email         TEXT,
    phonenr       TEXT,
    name          TEXT,
    FOREIGN KEY (
        userid
    )
    REFERENCES users (id) ON DELETE CASCADE
                          ON UPDATE NO ACTION
);


-- v_userinfo source

CREATE VIEW v_userinfo AS
    SELECT u.username,
           i.*
      FROM users u
           LEFT JOIN
           userinfo i ON u.id = i.userid;