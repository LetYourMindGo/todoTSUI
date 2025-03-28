export interface ListData {
    listid: number,
    listname: string,
    role: 'owner' | 'shared',
}

export interface Task {
    taskid: number,
    description: string,
    listid: number,
    isdone: boolean
};

export interface NewTask {
    description: string,
    listID: number
}

export interface TodoProps {
    listID: number
}

export interface AuthContextType {
    userID: number | null;
    login: (id: number, username: string) => void;
    logout: () => void;
}

export interface PopUpProps {
    userID: number;
    listID: number | null;
    setShowModal: (showModal: boolean) => void;
    action: string;
}

export interface ListUsers {
    username: string;
    role: string;
}

export interface TodoSharedListsProps {
    sharedLists: ListData[];
    username: string | null;
    userID: number;
}

export interface TodoOwnerListsProps {
    ownerLists: ListData[];
    username: string | null;
    setShowModal: (showModal: boolean) => void;
    setAction: (action: string) => void;
    setListID: (listID: number | null) => void;
}