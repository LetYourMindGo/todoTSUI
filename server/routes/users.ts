import { Request, Response } from "express";
import { pool } from "../dbconfig/dbconfig";
import argon2 from 'argon2';
import { NewUser } from "../types/types";

export const getUserID = async (req: Request, res: Response) => {
    try {
        const username = req.params.username;
        const password = req.body.password;

        const storedHashDB = await pool.query(
            'SELECT password \
            FROM users \
            WHERE LOWER(username) = LOWER($1)',
            [username]
        );
        if (!storedHashDB.rows[0]){
            res.json(-1);
            return;
        }
        const storedHash = storedHashDB.rows[0]?.password
        const isValid = await argon2.verify(storedHash, password);

        if (isValid) {
            const result = await pool.query(
                'SELECT userid \
                FROM users \
                WHERE LOWER(username) = LOWER($1) AND password = $2',
                [username, storedHash]
            );
            res.json(result.rows[0]?.userid);
        } else {
            res.json(-1);
        };
    } catch {
        res.status(500).json({ error:'DB error' });
    }
};


export const createUser = async (req: Request, res: Response) => {
    try {
        const newUser: NewUser = req.body;
        const hashedPassword = await argon2.hash(
            newUser.password,
            { type: argon2.argon2id }
        );

        const userCheck = await pool.query(
            'SELECT EXISTS( \
                SELECT 1 \
                FROM users \
                WHERE LOWER(username) = LOWER($1));',
            [newUser.username]
        );
        if (userCheck.rows[0].exists) {
            console.log(userCheck.rows[0]);
            res.json(-1);
            return;
        };

        const result = await pool.query(
            'INSERT INTO users (username, password) \
            VALUES ($1, $2)\
            RETURNING userid',
            [newUser.username, hashedPassword]
        );
        res.json(result.rows[0]?.userid || '');
    } catch {
        res.status(500).json({ error:'DB error' });
    }
};