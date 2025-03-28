import { Request, Response } from "express";
import { pool } from "../dbconfig/dbconfig";


export const createList = async (req: Request, res: Response) => {
    try {
        const newList = req.body
        const result = await pool.query(
            'INSERT INTO todolists (listName, ownerID) \
            VALUES ($1, $2) \
            RETURNING *',
            [newList.listName, newList.ownerID]
        );
        res.json(result.rows[0]?.listid || '');
    } catch {
        res.status(500).json({ error:'DB error' });
    }
};


export const getListData = async (req: Request, res: Response) => {
    try {
        const listID = Number(req.params.listID);
        const listData = await pool.query(
            'SELECT listName, ownerID \
            FROM todolists \
            WHERE listID = $1',
            [listID]
        );

        if (listData.rows.length === 0) {
            res.status(404).json({ error: 'List not found' });
        }

        const { listname, ownerid } = listData.rows[0];

        const sharedUsers = await pool.query(
            "SELECT \
                users.userID, users.username \
            FROM \
                shared_lists \
            JOIN \
                users ON shared_lists.userID = users.userID \
            WHERE \
                shared_lists.listID = $1",
            [listID]
        );

        res.json({
            listID,
            listName: listname,
            ownerID: ownerid,
            sharedWith: sharedUsers.rows,
        });
    } catch (err) {
        console.error('Error while getting list:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};


export const getUserLists = async (req: Request, res: Response) => {
    try {
        const userID = Number(req.params.userID);
        const result = await pool.query(
            "SELECT \
                l.listID, \
                l.listName, \
                CASE \
                    WHEN l.ownerID = $1 THEN 'owner' \
                    WHEN s.userID = $1 THEN 'shared' \
                END AS role \
            FROM \
                todoLists l \
            LEFT JOIN \
                shared_lists s ON l.listID = s.listID AND s.userID = $1 \
            WHERE \
                l.ownerID = $1 OR s.userID = $1;",
            [userID]
        );
        const listData = result.rows.map(row => row)
        res.json(listData);
    } catch {
        res.status(500).json({ error:'DB error' });
    }
};


export const shareList = async (req: Request, res: Response) => {
    try {
        const listID = Number(req.params.listID);
        const username = req.body.username;

        const user = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]  
        );
        const userID = user.rows[0].userid;
    
        if (!userID) {
            res.status(400).json({ error: 'userID has to be provided' });
        }

        const listCheck = await pool.query(
            'SELECT * FROM todolists WHERE listID = $1',
            [listID]
        );

        if (listCheck.rows.length === 0) {
            res.status(404).json({ error: 'The list is not found' });
        }

        if (listCheck.rows[0].ownerid === userID) {
            res.status(400).json({
                error: 'The user is already the owner of the list'
            });
        }

        await pool.query(
            'INSERT INTO shared_lists (listID, userID) \
            VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [listID, userID]
        );

        res.json({ message: 'The user has been added to shared_with' });
    } catch (err) {
        console.error('Error while adding to shared_lists:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const cancelShareList = async (req: Request, res: Response) => {
    try {
        const listID = Number(req.params.listID);
        const userID = req.body.userID;

        const listCheck = await pool.query(
            'SELECT * FROM todolists WHERE listID = $1',
            [listID]
        );

        if (listCheck.rows.length === 0) {
            res.status(404).json({ error: 'The list is not found' });
        };

        await pool.query(
            'DELETE FROM shared_lists \
            WHERE listID = $1 AND userID = $2',
            [listID, userID]
        );

        res.json({ message: 'The user has been removed from shared_with' });
    } catch (err) {
        console.error('Error while removing from shared_lists:', err);
        res.status(500).json({ error: 'Server error' });
    }
}


export const updateListName = async (req: Request, res: Response) => {
    try {
        const listID = Number(req.params.listID);
        const newListName = req.body.newListName;

        const listCheck = await pool.query(
            'SELECT * FROM todolists WHERE listID = $1',
            [listID]
        );

        if (listCheck.rows.length === 0) {
            res.status(404).json({ error: 'The list is not found' });
        };

        await pool.query(
            'UPDATE todolists \
            SET listName = $1 \
            WHERE listID = $2',
            [newListName, listID]
        );

        res.json({ message: 'The list name has been updated' });
    } catch {
        res.status(500).json({ error:'DB error' });
    };
};

export const deleteList = async (req: Request, res: Response) => {
    try {
        const listID = Number(req.params.listID);

        const listCheck = await pool.query(
            'SELECT * FROM todolists WHERE listID = $1',
            [listID]
        );

        if (listCheck.rows.length === 0) {
            res.status(404).json({ error: 'The list is not found' });
        };

        await pool.query(
            'DELETE FROM todolists WHERE listID = $1',
            [listID]
        );

        res.json({ message: 'The list has been deleted' });
    } catch {
        res.status(500).json({ error:'DB error' });
    };
};