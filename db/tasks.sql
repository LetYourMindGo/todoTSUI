CREATE TABLE tasks (
    taskID SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    listID INT NOT NULL REFERENCES todolists(listID) ON DELETE CASCADE,
    isDone BOOLEAN DEFAULT false
);