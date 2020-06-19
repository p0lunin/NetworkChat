import Axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { useCookies } from "react-cookie";
import { isArray } from "util";

export interface Server {
    registration(name: string, password: string): Promise<true>;
    authorization(name: string, password: string): Promise<{ token: string; user: User; }>;
    hello(token: string): Promise<User>;
    getAllUsers(): Promise<User[]>;
    createChat(token: string, title: string): Promise<Chat>;
    getMyChats(token: string): Promise<Chat[]>;
    addUserToChat(token: string, chatId: number, username: string): Promise<ChatMember>;
    deleteChat(token: string, chatId: number): Promise<true>;
    removeUserFromChat(token: string, chatId: number, username: string): Promise<true>;
    sendTextMessage(token: string, chatId: number, text: string): Promise<TextMessage>;
    sendFile(token: string, chatId: number, file: File): Promise<FileMessage>;
    sendImage(token: string, chatId: number, file: File): Promise<ImageMessage>;
    getUpdates(token: string): Promise<Update[]>;
}

export enum ErrorKind {
    UsernameWasExists,
    IncorrectPasswordOrUsername,
    SessionNotFound,
    ChatNotFound,
    UserNotFound,
    NotEnoughRights,
    UserAlreadyInChat,
    Unknown,
}

export class ServerError extends Error  {
    constructor(public kind: ErrorKind, public mes?: string) {
        super(mes)
    }
    public errorString(): string {
        if (this.mes == undefined) {
            switch (this.kind) {
                case ErrorKind.IncorrectPasswordOrUsername:
                    return "Неправильное имя пользователя или пароль.";
                case ErrorKind.SessionNotFound:
                    return "Сессия не найдена, или ее срок истек.";
                case ErrorKind.UsernameWasExists:
                    return "Имя пользователя уже существует.";
                case ErrorKind.ChatNotFound:
                    return "Чат не найден!";
                case ErrorKind.UserNotFound:
                    return "Пользователь не найден!";
                case ErrorKind.NotEnoughRights:
                    return "Недостаточно прав для совершения этого действия!";
                case ErrorKind.UserAlreadyInChat:
                    return "Пользователь уже находится в чате.";
                case ErrorKind.Unknown:
                    return "Неизвестная ошибка. Попробуйте еще раз."
            }
        }
        else {
            return this.mes;
        }
    }
}

export class MessageInfo {
    constructor (
        public id: number,
        public from_user: User,
        public date: Date,
    ) {}
}

export enum MessageType {
    Text,
    Image,
    File,
}

export class TextMessage {
    constructor (
        public info: MessageInfo,
        public type: MessageType.Text,
        public text: string,
    ) {}
}

export class ImageMessage {
    constructor (
        public info: MessageInfo,
        public type: MessageType.Image,
        public image: FileInfo,
    ) {}
}

export class FileMessage {
    constructor (
        public info: MessageInfo,
        public type: MessageType.File,
        public file: FileInfo,
    ) {}
}

export class FileInfo {
    constructor(
        public name: string,
        public url: string,
    ) {}
}

type Message = TextMessage | ImageMessage | FileMessage;

export class Chat {
    constructor(
        public title: string,
        public id: number,
        public members: ChatMember[],
        public messages: Message[],
    ) {}
}

export class User {
    constructor(public name: string, public isOnline: boolean = false) {}
}

export enum MemberType {
    Common,
    Admin,
}

export class ChatMember {
    constructor(public user: User, public memberType: MemberType) {}
}

export enum UpdateType {
    NewMessage,
    NewMember,
    NewChat,
    NewUser,
    NewOnlineUser,
    RemoveOnlineUser,
    RemoveChat,
    RemoveMember,
}

export type NewMessageUpdate = {
    type: UpdateType.NewMessage,
    message: Message,
    chat_id: number,
}
export type NewMemberUpdate = {
    type: UpdateType.NewMember,
    member: ChatMember,
    chat: Chat,
}
export type NewChatUpdate = {
    type: UpdateType.NewChat,
    chat: Chat,
}
export type NewUserUpdate = {
    type: UpdateType.NewUser,
    user: User,
}
export type NewOnlineUserUpdate = {
    type: UpdateType.NewOnlineUser,
    username: string,
}
export type RemoveOnlineUserUpdate = {
    type: UpdateType.RemoveOnlineUser,
    username: string,
}
export type RemoveChatUpdate = {
    type: UpdateType.RemoveChat,
    chat_id: number,
}
export type RemoveMemberUpdate = {
    type: UpdateType.RemoveMember,
    member_username: string,
    chat_id: number,
}

export type Update = 
    NewMessageUpdate | 
    NewMemberUpdate | 
    NewChatUpdate | 
    NewUserUpdate | 
    NewOnlineUserUpdate | 
    RemoveOnlineUserUpdate | 
    RemoveChatUpdate | 
    RemoveMemberUpdate;

export class MemoryServer implements Server {
    private users: [User, String][];
    private tokens: [User, String][];
    private chats: Chat[];
    constructor() {
        this.users = [];
        this.tokens = [];
        this.chats = [];
    }
    async getUpdates(token: string): Promise<Update[]> {
        return [];
    }
    async sendImage(token: string, chat_id: number, file: File): Promise<ImageMessage> {
        const user = this.getUserByToken(token);
        let chat = this.getChatById(chat_id);
        let message = new ImageMessage(
            new MessageInfo(chat.messages.length, user, new Date()),
            MessageType.Image,
            new FileInfo(file.name, (file as any).webkitRelativePath),
        );
        // We already push in component
        //chat.messages.push(message);
        return message;
    }
    async sendFile(token: string, chat_id: number, file: File): Promise<FileMessage> {
        const user = this.getUserByToken(token);
        let chat = this.getChatById(chat_id);
        let message = new FileMessage(
            new MessageInfo(chat.messages.length, user, new Date()),
            MessageType.File,
            new FileInfo(file.name, (file as any).webkitRelativePath),
        );
        // We already push in component
        //chat.messages.push(message);
        return message;
    }
    async sendTextMessage(token: string, chat_id: number, text: string): Promise<TextMessage> {
        const user = this.getUserByToken(token);
        let chat = this.getChatById(chat_id);
        let message = new TextMessage(
            new MessageInfo(chat.messages.length, user, new Date()), 
            MessageType.Text, 
            text
        );
        // We already push in component
        //chat.messages.push(message);
        return message;
    }
    async removeUserFromChat(token: string, chat_id: number, username: string): Promise<true> {
        const user = this.getUserByToken(token);
        let chat = this.getChatById(chat_id);
        this.assertUserIsAdmin(user, chat);

        let m = chat.members.findIndex(member => member.user.name == username);
        if (m == -1) {
            throw new ServerError(ErrorKind.UserNotFound);
        }
        else {
            chat.members.splice(m, 1);
            return true;
        }
    }
    async deleteChat(token: string, chat_id: number): Promise<true> {
        const user = this.getUserByToken(token);
        const chat = this.chats.findIndex(chat => chat.id == chat_id);
        if (chat == -1) {
            throw new ServerError(ErrorKind.ChatNotFound);
        }
        else {
            this.assertUserIsAdmin(user, this.chats[chat]);
            this.chats.splice(chat, 1);
            return true;
        }
    }
    async registration(name: string, password: string): Promise<true> {
        if (this.users.find(user => user[0].name === name) === undefined) {
            let user = new User(name);
            this.users.push([user, password]);
            return true;
        }
        else {
            throw new ServerError(ErrorKind.UsernameWasExists)
        }
    }
    async authorization(name: string, password: string): Promise<{ token: string; user: User; }>
    {
        let record = this.users.find(u => u[0].name === name && u[1] === password);
        if (record === undefined) {
            throw new ServerError(ErrorKind.IncorrectPasswordOrUsername);
        }
        else {
            let token = password;
            this.tokens.push([record[0], token]);
            return {
                token,
                user: record[0],
            };
        }
    }
    async getAllUsers(): Promise<User[]> {
        return this.users.map(u => u[0]);
    }
    async hello(token: string): Promise<User> {
        const user = this.getUserByToken(token);
        user.isOnline = true;
        return user;
    }
    async unauthorize(token: string): Promise<true> {
        let res = this.tokens.findIndex(pair => pair[1] == token);
        if (res == undefined) {
            throw new ServerError(ErrorKind.SessionNotFound);
        }
        else {
            this.tokens.splice(res, 1);
            return true;
        }
    }
    async getMyChats(token: string): Promise<Chat[]> {
        const user = this.getUserByToken(token);
        const chats = this.chats.filter(chat => chat.members.find(member => member.user == user) != undefined);
        return chats;
    }
    async createChat(token: string, title: string): Promise<Chat> {
        const user = this.getUserByToken(token);
        const chat_id = this.chats.length;
        const chat = new Chat(title, chat_id, [new ChatMember(user, MemberType.Admin)], []);
        this.chats.push(chat);
        return chat;
    }
    async addUserToChat(token: string, chat_id: number, username: string): Promise<ChatMember> {
        const adderr = this.getUserByToken(token);
        let chat = this.getChatById(chat_id);
        let adder = chat.members.find(member => member.user == adderr);
        if (adder == undefined) {
            throw new ServerError(ErrorKind.ChatNotFound);
        }
        if (adder.memberType == MemberType.Common) {
            throw new ServerError(ErrorKind.NotEnoughRights);
        }
        let user = this.users.find(user => user[0].name == username);
        if (user == undefined) {
            throw new ServerError(ErrorKind.UserNotFound);
        }
        else {
            const member = new ChatMember(user[0], MemberType.Common);
            chat.members.push(member);
            return member;
        }
    }
    getUserByToken(token: string): User {
        const res = this.tokens.find(p => p[1] == token);
        if (res == undefined) {
            throw new ServerError(ErrorKind.SessionNotFound);
        }
        else {
            return res[0];
        }
    }
    getChatById(chat_id: number): Chat {
        let chat = this.chats.find(chat => chat.id == chat_id);
        if (chat == undefined) {
            throw new ServerError(ErrorKind.ChatNotFound);
        }
        else {
            return chat;
        }
    }
    assertUserIsAdmin(user: User, chat: Chat): void {
        let adder = chat.members.find(member => member.user == user);
        if (adder == undefined) {
            throw new ServerError(ErrorKind.ChatNotFound);
        }
        if (adder.memberType == MemberType.Common) {
            throw new ServerError(ErrorKind.NotEnoughRights);
        }
    }
}

export class BackendServer implements Server {
    private baseUrl: string;
    private update_from: number;
    constructor(url: string) {
        this.baseUrl = url;
        this.update_from = 0;
    }
    async registration(name: string, password: string): Promise<true> {
        const resp = await Axios.post(constructURL(this.baseUrl, ["users", "registration"]), { name, password });
        const response = resp.data;
        validateNoError(response);
        return true;
    }
    async authorization(name: string, password: string): Promise<{ token: string; user: User; }> {
        const resp = await Axios.post(constructURL(this.baseUrl, ["users", "authorization"]), { name, password });
        const response = resp.data;
        validateNoError(response);
        if (response.Token && response.User)
            return { token: response.Token, user: parseUser(response.User) };
        else
            throw new ServerError(ErrorKind.Unknown);
    }
    async hello(token: string): Promise<User> {
        return await makeRequest(this.baseUrl, ["users", "hello"], createHeaders(token), (input) => {
            if (input.LastUpdateId) {
                this.update_from = input.LastUpdateId;
                return parseUser(input.User);
            }
            else {
                throw new ServerError(ErrorKind.Unknown);
            }
        });
    }
    async getAllUsers(): Promise<User[]> {
        var resp = await Axios.get<string>(constructURL(this.baseUrl, ["users"]));
        const response = resp.data;
        validateNoError(response);
        if (Array.isArray(response)) {
            return response.map(parseUser);
        }
        else {
            throw new ServerError(ErrorKind.Unknown);
        }
    }
    async createChat(token: string, title: string): Promise<Chat> {
        return await makeRequest(this.baseUrl, ["chats", "create"], createHeaders(token), parseChat, { title });
    }
    async getMyChats(token: string): Promise<Chat[]> {
        return await makeRequest(this.baseUrl, ["chats", "my-chats"], createHeaders(token), (input) => {
            if (Array.isArray(input)) {
                return input.map(parseChat);
            }
            else {
                throw new ServerError(ErrorKind.Unknown);
            }
        });
    }
    async addUserToChat(token: string, chatId: number, username: string): Promise<ChatMember> {
        return await makeRequest(
            this.baseUrl, 
            ["chats", chatId, `add-user?username=${username}`], 
            createHeaders(token), 
            parseChatMember
        );
    }
    async deleteChat(token: string, chatId: number): Promise<true> {
        return await makeRequest(
            this.baseUrl, 
            ["chats", chatId, `delete`], 
            createHeaders(token), 
            () => true,
        );
    }
    async removeUserFromChat(token: string, chatId: number, username: string): Promise<true> {
        return await makeRequest(
            this.baseUrl, 
            ["chats", chatId, `delete?remove-user=${username}`], 
            createHeaders(token), 
            () => true,
        );
    }
    async sendTextMessage(token: string, chatId: number, text: string): Promise<TextMessage> {
        return await makeRequest(
            this.baseUrl, 
            ["chats", chatId, `send-text-message`], 
            createHeaders(token), 
            parseTextMessage,
            { text },
        );
    }
    async sendFile(token: string, chatId: number, file: File): Promise<FileMessage> {
        let bodyData = new FormData();
        bodyData.append("file", file);
        return await makeRequest(
            this.baseUrl, 
            ["chats", chatId, `send-file-message`], 
            {
                headers: {
                    Authorization: "Bearer " + token,
                    'Content-type': "multipart/form-data",
                },
            }, 
            parseFileMessage,
            bodyData,
        );
    }
    async sendImage(token: string, chatId: number, file: File): Promise<ImageMessage> {
        let bodyData = new FormData();
        bodyData.append("file", file);
        return await makeRequest(
            this.baseUrl, 
            ["chats", chatId, `send-image-message`], 
            {
                headers: {
                    Authorization: "Bearer " + token,
                    'Content-type': "multipart/form-data",
                },
            }, 
            parseImageMessage,
            bodyData,
        );
    }
    async getUpdates(token: string): Promise<Update[]> {
        let self = this;
        return await makeRequest(
            this.baseUrl, 
            ["users", `get-updates?from=${this.update_from}`], 
            createHeaders(token), 
            (input) => {
                let [updates, lastNum] = parseUpdates(input, self.update_from);
                self.update_from = lastNum;
                return updates;
            }
        );
    }
}

async function makeRequest<T>(base: string, args: any[], config: AxiosRequestConfig, parseFuncion: (a: any) => T, body?: any): Promise<T> {
    let response;
    try {
        const resp = await Axios.post(
            constructURL(base, args), 
            body, 
            config,
        );
        response = resp.data;
    }
    catch (e) {
        console.log(e.response); 
        response = e.response.data;
    }
    validateNoError(response);
    return parseFuncion(response);
}

function createHeaders(token: string): { headers: { Authorization: string, 'Content-type': 'application/json' } } {
    return {
        headers: {
            Authorization: "Bearer " + token,
            'Content-type': 'application/json'
        }
    }
}

function parseUpdates(input: any, prev: number): [Update[], number] {
    if (Array.isArray(input)) {
        let lastNum = -1;
        const res = input.map(data => {
            if (data.ID > lastNum) {
                lastNum = data.ID;
            }
            return parseUpdate(data);
        });
        if (lastNum == -1) {
            lastNum = prev;
        }
        else {
            lastNum += 1;
        }
        return [res, lastNum];
    }
    else {
        throw new ServerError(ErrorKind.Unknown);
    }
}

function parseUpdate(input: any): Update {
    if (input.NewMessage !== undefined) {
        return {
            type: UpdateType.NewMessage,
            message: parseMessage(input.NewMessage),
            chat_id: parseChat(input.Chat).id 
        }
    }
    else if (input.NewMember !== undefined) {
        return {
            type: UpdateType.NewMember,
            member: parseChatMember(input.NewMember),
            chat: parseChat(input.Chat),
        }
    }
    else if (input.NewChat !== undefined) {
        return {
            type: UpdateType.NewChat,
            chat: parseChat(input.NewChat)
        }
    }
    else if (input.NewUser !== undefined) {
        return {
            type: UpdateType.NewUser,
            user: parseUser(input.NewUser),
        }
    }
    else if (input.NewOnlineUsername !== undefined) {
        return {
            type: UpdateType.NewOnlineUser,
            username: input.NewOnlineUsername
        }
    }
    else if (input.RemoveOnlineUsername !== undefined) {
        return {
            type: UpdateType.RemoveOnlineUser,
            username: input.RemoveOnlineUsername
        }
    }
    else if (input.RemoveChat !== undefined) {
        return {
            type: UpdateType.RemoveChat,
            chat_id: parseChat(input.RemoveChat).id
        }
    }
    else if (input.RemoveMemberUsername !== undefined) {
        return {
            type: UpdateType.RemoveMember,
            member_username: input.RemoveMemberUsername,
            chat_id: parseChat(input.Chat).id
        }
    }
    else {
        throw new ServerError(ErrorKind.Unknown);
    }
}

function parseChat(input: any): Chat {
    if (input.Title != undefined && input.ID != undefined && input.Members != undefined && input.Messages != undefined)
        return new Chat(input.Title, input.ID, input.Members.map(parseChatMember), input.Messages.map(parseMessage));
    else
        throw new ServerError(ErrorKind.Unknown);
}

function parseChatMember(input: any): ChatMember {
    if (input.User !== undefined && input.MemberType !== undefined)
        return new ChatMember(parseUser(input.User), parseMemberType(input.MemberType));
    else
        throw new ServerError(ErrorKind.Unknown);
}

function parseMessage(input: any): Message {
    try {
        return parseTextMessage(input);
    }
    catch {
        try {
            return parseFileMessage(input);
        }
        catch {
            return parseImageMessage(input);
        }
    }
}

function parseTextMessage(input: any): TextMessage {
    if (input.Text !== undefined) {
        let info = parseMessageInfo(input);
        let text = input.Text;
        return new TextMessage(info, MessageType.Text, text);
    }
    else {
        throw new ServerError(ErrorKind.Unknown);
    }
}

function parseFileMessage(input: any): FileMessage {
    if (input.File !== undefined) {
        let info = parseMessageInfo(input);
        let file = input.File;
        return new FileMessage(info, MessageType.File, parseFileInfo(file));
    }
    else {
        throw new ServerError(ErrorKind.Unknown);
    }
}

function parseFileInfo(input: any): FileInfo {
    if (input.Name !== undefined && input.URL !== undefined)
        return new FileInfo(input.Name, input.URL)
    else
        throw new ServerError(ErrorKind.Unknown);
}

function parseImageMessage(input: any): ImageMessage {
    if (input.Image !== undefined) {
        let info = parseMessageInfo(input);
        let image = input.Image;
        return new ImageMessage(info, MessageType.Image, parseFileInfo(image));
    }
    else {
        throw new ServerError(ErrorKind.Unknown);
    }
}

function parseMessageInfo(input: any): MessageInfo {
    if (input.ID !== undefined && input.FromUser !== undefined && input.Date !== undefined) {
        return new MessageInfo(input.ID, parseUser(input.FromUser), input.Date);
    }
    else {
        throw new ServerError(ErrorKind.Unknown);
    }
}

function parseMemberType(input: any): MemberType {
    if (input === 0)
        return MemberType.Common;
    else if (input === 1)
        return MemberType.Admin;
    else
        throw new ServerError(ErrorKind.Unknown);
}

function parseUser(input: any): User {
    if (input.Name != undefined && input.IsOnline != undefined)
        return new User(input.Name, input.IsOnline)
    else
        throw new ServerError(ErrorKind.Unknown);
}

function validateNoError(input: any): void {
    if (input.Error)
        throw new ServerError(parseError(input.Error));
}

function parseError(s: string): ErrorKind {
    switch (s) {
        case "Token not found": return ErrorKind.SessionNotFound;
        case "User not found": return ErrorKind.UserNotFound;
        case "User not have enough rights": return ErrorKind.NotEnoughRights;
        case "User already in chat": return ErrorKind.UserAlreadyInChat;
        case "Chat not found": return ErrorKind.ChatNotFound;
        case "Username already exists": return ErrorKind.UsernameWasExists;
        default: return ErrorKind.Unknown; 
    }
}

function constructURL(base: string, args?: any[]): string {
    let res = base;
    if (args)
        args.forEach(arg => res = res + "/" + arg.toString());
    return res;
}