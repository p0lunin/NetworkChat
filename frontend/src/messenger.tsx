import React, { useState, useEffect, useRef } from 'react';
import { User, Server, Chat, ServerError, TextMessage, MessageType, FileMessage, ImageMessage, UpdateType } from './requests';
import { 
  List, ListItemText, createStyles, Theme, makeStyles, ListItemAvatar,
  Avatar, ListItem, Button, Dialog, DialogTitle, DialogActions, FormControl, 
  FormLabel, RadioGroup, FormControlLabel, Radio, TextField, DialogContent, 
  DialogContentText, Box, IconButton, AppBar, Typography, Badge, Toolbar, Divider, TextareaAutosize 
} from '@material-ui/core';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import { green, red } from '@material-ui/core/colors';
import { Close as CloseIcon, Mail as MailIcon, People as PeopleIcon } from '@material-ui/icons';
import { Error, errorToShowed } from './App';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    green: {
      color: theme.palette.getContrastText(green[500]),
      backgroundColor: green[500],
    },
    red: {
      color: theme.palette.getContrastText(red[500]),
      backgroundColor: red[500],
    },
    chatInfoWidth: {
      width: 300,
    }
  }),
);

function UsersList(props: { users: User[]}) {
  const users = props.users;
  const classes = useStyles();
  const [value, setValue] = useState('all');
  const [name, setName] = useState('');
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = (event.target as HTMLInputElement).value;
    setValue(val);
  };

  let users_list: User[] = [];
  switch (value) {
    case "all": 
      users_list = users;
      break;
    case "online": 
      users_list = users.filter(u => u.isOnline);
      break;
    case "byname": 
      users_list = users.filter(u => u.name.search(name) != -1)
      break;
  }

  const users_comps = users_list.map(u => {
    return (
        <ListItem key={u.name}>
            <ListItemAvatar>
                <Avatar className={ u.isOnline ? classes.green : classes.red }>{u.name[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={ u.name }></ListItemText>
        </ListItem>
    );
  });

  return (
    <div>
      <FormControl component="fieldset">
        <RadioGroup name="radio_buttons" value={value} onChange={handleChange}>
          <FormControlLabel value="all" control={<Radio />} label="All" defaultChecked={true} />
          <FormControlLabel value="online" control={<Radio />} label="Online" />
          <FormControlLabel value="byname" control={<Radio />} label="By name" />
        </RadioGroup>
        { value=="byname" ? <TextField onChange={(e) => { setName(e.currentTarget.value) }}/> : null }
      </FormControl>
      <List>
        {users_comps}
      </List>
    </div>
  );
}

function ChatList(props: { chats: Chat[], onSelectChat: (a: Chat) => void }) {
  const chats_list = props.chats.map(c => {
    return (
      <Box onClick={ () => props.onSelectChat(c) }>
        <Divider />
        <ListItem key={c.id} button>
            <ListItemAvatar>
                <Avatar>{c.title[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={ c.title }></ListItemText>
        </ListItem>
      </Box>
    );
  });

  return (
    <div>
      <List>
        {chats_list}
        <Divider />
      </List>
    </div>
  );
}

function LogOutButton(props: { onLogOut: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button color="secondary" onClick={() => setOpen(true)}>Log out</Button>
      <Dialog open={open}>
        <DialogTitle>Are you sure you want log out?</DialogTitle>
        <DialogActions>
          <Button onClick={() => { setOpen(false); props.onLogOut(); }} color="primary">
            Yes
          </Button>
          <Button onClick={() => setOpen(false)} color="primary" autoFocus>
            No
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function ButtonAddChat(props: { onAdd: (title: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const onClose = () => {
    setText("");
    setOpen(false);
  }
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Создать чат</Button>
      <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Создание чата</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Введите название чата для его создания
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Название чата"
            fullWidth
            value={text}
            onChange={(e) => { setText(e.currentTarget.value) }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Отмена
          </Button>
          <Button onClick={() => { props.onAdd(text); onClose(); }} color="primary">
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function ButtonAddUser(props: { onAdd: (username: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Добавить пользователя</Button>
      <Dialog open={open}>
        <DialogContent>
          <DialogContentText>
            Введите юзернейм пользователя которого вы собираетесь добавить
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Имя пользователя"
            fullWidth
            value={text}
            onChange={(e) => { setText(e.currentTarget.value) }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={() => { props.onAdd(text); setOpen(false); }} color="primary">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function ButtonRemoveUser(props: { onRemove: (username: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Удалить пользователя</Button>
      <Dialog open={open}>
        <DialogContent>
          <DialogContentText>
            Введите юзернейм пользователя которого вы собираетесь удалить
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Имя пользователя"
            fullWidth
            value={text}
            onChange={(e) => { setText(e.currentTarget.value) }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={() => { props.onRemove(text); setOpen(false); }} color="primary">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function ButtonDeleteChat(props: { chat: Chat, onDelete: (chat_id: number) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button color="primary" onClick={() => setOpen(true)}>Удалить чат</Button>
      <Dialog open={open}>
        <DialogTitle>Вы уверены что хотите удалить чат {props.chat.title}?</DialogTitle>
        <DialogActions>
          <Button onClick={() => { setOpen(false); props.onDelete(props.chat.id); }} color="primary">
            Да
          </Button>
          <Button onClick={() => setOpen(false)} color="primary" autoFocus>
            Нет
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

type ChatInfoProps = {
  chat: Chat, 
  open: boolean, 
  onClose: () => void, 
  onAddUser: (username: string, chat: Chat) => void,
  onRemoveUser: (username: string, chat: Chat) => void,
  onDeleteChat: (chat_id: number) => void,
}

function ChatInfo(props: ChatInfoProps) {
  const {chat, open, onClose, onAddUser, onDeleteChat, onRemoveUser} = props;
  return (
    <Dialog open={open} onClose={onClose}>
      <Box width="300px">
        <MuiDialogTitle disableTypography>
          <Box display="flex" flexDirection="row" justifyContent="space-between">
            <Box flexGrow="2">
              <Avatar>{chat.title[0]}</Avatar>
            </Box>
            <Box flexGrow="8">
              {chat.title}
            </Box>
            <Box flexGrow="1">
              <IconButton aria-label="close" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </MuiDialogTitle>
        <ButtonDeleteChat chat={chat} onDelete={onDeleteChat} />
        <hr></hr>
        <p>Users:</p>
        <ButtonRemoveUser onRemove={(username) => onRemoveUser(username, chat)}/>
        <ButtonAddUser onAdd={(username) => onAddUser(username, chat)} />
        <UsersList users={chat.members.map(m => m.user)} />
      </Box>
    </Dialog>
  );
}

function TextMessageComponent(props: { message: TextMessage, user: User, key: string }) {
  const classes = useStyles();
  const {message, user, key} = props;
  console.log(props);
  return (
    <ListItem key={key} id={"message_"+message.info.id}>
      <ListItemAvatar>
        <Avatar className={ user.isOnline ? classes.green : classes.red }>{user.name[0]}</Avatar>
      </ListItemAvatar>
      <ListItemText 
        primary={ user.name }
        secondary={ message.text }
      >
      </ListItemText>
    </ListItem>
  );
}

function FileMessageComponent(props: { message: FileMessage, user: User, key: string }) {
  const classes = useStyles();
  const {message, user, key} = props;
  return (
    <ListItem key={key} id={"message_"+message.info.id}>
      <ListItemAvatar>
        <Avatar className={ user.isOnline ? classes.green : classes.red }>{user.name[0]}</Avatar>
      </ListItemAvatar>
      <ListItemText 
        primary={ user.name }
        secondary={ <span>FILE: {message.file.name}<br></br><a href={message.file.url}>Download</a></span> }
      >
      </ListItemText>
    </ListItem>
  );
}

function ImageMessageComponent(props: { message: ImageMessage, user: User, key: string }) {
  const classes = useStyles();
  const {message, user, key} = props;
  return (
    <ListItem key={key} id={"message_"+message.info.id}>
      <ListItemAvatar>
        <Avatar className={ user.isOnline ? classes.green : classes.red }>{user.name[0]}</Avatar>
      </ListItemAvatar>
      <ListItemText 
        primary={ user.name }
        secondary={ <img src={message.image.url} /> }
      >
      </ListItemText>
    </ListItem>
  );
}

function ButtonSendFile(props: {onSend: (file: File) => void, onError: (error: string) => void}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<null | File>(null);

  const onSendFile = () => {
    if (file == null) {
      props.onError("Выберите файл!");
    }
    else {
      setOpen(false);
      props.onSend(file);
    }
  };

  return (
    <Box width="100%">
      <Button onClick={() => setOpen(true)}>
        Прикрепить файл
      </Button>
      <Dialog open={open}>
        <DialogTitle>
          Выберите файл
        </DialogTitle>
        <DialogContent>
          <input type="file" name="file" onChange={(e) => setFile((e.currentTarget.files as FileList)[0])} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onSendFile()} color="primary">
            Отправить
          </Button>
          <Button onClick={() => setOpen(false)} color="primary" autoFocus>
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function ButtonSendImage(props: {onSend: (file: File) => void, onError: (error: string) => void}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<null | File>(null);

  const onSendImage = () => {
    if (file == null) {
      props.onError("Выберите файл!");
    }
    else {
      setOpen(false);
      props.onSend(file);
    }
  };

  return (
    <Box width="100%">
      <Button onClick={() => setOpen(true)}>
        Прикрепить изображение
      </Button>
      <Dialog open={open}>
        <DialogTitle>
          Выберите изображение
        </DialogTitle>
        <DialogContent>
          <input type="file" name="file" onChange={(e) => setFile((e.currentTarget.files as FileList)[0])} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onSendImage()} color="primary">
            Отправить
          </Button>
          <Button onClick={() => setOpen(false)} color="primary" autoFocus>
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

type ChatWindowProps = {
  chat: Chat, 
  onAddUser: (username: string, chat: Chat) => void,
  onRemoveUser: (username: string, chat: Chat) => void,
  onDeleteChat: (chat_id: number) => void,
  onSendTextMessage: (chat_id: number, text: string) => void,
  onSendFile: (chat_id: number, file: File) => void,
  onSendImage: (chat_id: number, file: File) => void,
  onError: (err: string) => void,
  users: User[],
}

let needScroll = true;
function ChatWindow(props: ChatWindowProps) {
  const {chat, onAddUser, onDeleteChat, onRemoveUser, onSendTextMessage, onSendFile, onSendImage, onError, users} = props;
  const [chatInfoOpen, setOpen] = useState(false);
  const [text, setText] = useState("");
  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight) {
      needScroll = true;
    }
    else {
      needScroll = false;
      console.log(e.currentTarget.scrollHeight + " " + e.currentTarget.scrollTop + " " + e.currentTarget.clientHeight);
    }
  };

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (needScroll) {
      if (ref.current != null) {
        ref.current.scrollIntoView();
      }
    }
  }, [props]);

  return (
    <Box height="100%">
      <Box display="flex" flexDirection="column" height="100%">
        <Button onClick={() => setOpen(true)}>
          <Box width="100%">
            <ListItem>
              <ListItemAvatar>
                <Avatar>{chat.title[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={ chat.title }></ListItemText>
            </ListItem>
          </Box>
        </Button>
        <Divider />
        <Box maxHeight="100%" overflow="auto" flexGrow="1" onScroll={onScroll}>
          <Box display="flex" flexDirection="column-reverse" minHeight="100%">
            {chat.messages.sort((l, r) => r.info.id - l.info.id).map((mes, idx, arr) => {
              if (needScroll && idx == 0) {
                switch (mes.type) {
                  case MessageType.Text:
                    let el1 = (
                      <div ref={ref}>
                        <TextMessageComponent
                          message={mes}
                          key={mes.info.id.toString()} 
                          user={mes.info.from_user}
                        />
                      </div>
                    );
                    return el1;
                  case MessageType.File:
                    let el2 = (
                      <div ref={ref}>
                        <FileMessageComponent 
                          message={mes}
                          key={mes.info.id.toString()} 
                          user={mes.info.from_user}
                        />
                      </div>
                    );
                    return el2;
                  case MessageType.Image:
                    let el3 = (
                      <div ref={ref}>
                        <ImageMessageComponent 
                          message={mes}
                          key={mes.info.id.toString()} 
                          user={mes.info.from_user}
                        />
                      </div>
                    );
                    return el3;
                }
              }
              else {
                switch (mes.type) {
                  case MessageType.Text:
                    let el1 = (
                        <TextMessageComponent
                          message={mes}
                          key={mes.info.id.toString()} 
                          user={mes.info.from_user}
                        />
                    );
                    return el1;
                  case MessageType.File:
                    let el2 = (
                        <FileMessageComponent 
                          message={mes}
                          key={mes.info.id.toString()} 
                          user={mes.info.from_user}
                        />
                    );
                    return el2;
                  case MessageType.Image:
                    let el3 = (
                        <ImageMessageComponent 
                          message={mes}
                          key={mes.info.id.toString()} 
                          user={mes.info.from_user}
                        />
                    );
                    return el3;
                }
              }
            })}
          </Box>
        </Box>
        <Box width="100%" display="flex" flexDirection="row" borderTop="1px rgba(0, 0, 0, 0.12) solid">
          <TextField 
            multiline
            fullWidth={true}
            rows={4}
            variant="outlined"
            onChange={(e) => setText(e.currentTarget.value)}
          />
          <Box>
            <Button onClick={() => { 
              onSendTextMessage(chat.id, text); 
              needScroll=true; } 
            } disabled={text == ""}><Box width="100%">Отправить</Box></Button>
            <Divider />
            <ButtonSendFile onSend={(file) => onSendFile(chat.id, file)} onError={onError}/>
            <Divider />
            <ButtonSendImage onSend={(file) => onSendImage(chat.id, file)} onError={onError}/>
          </Box>
        </Box>
      </Box>
      <ChatInfo 
        chat={chat} 
        open={chatInfoOpen} 
        onClose={() => setOpen(false)}
        onAddUser={onAddUser} 
        onDeleteChat={(c) => { setOpen(false); onDeleteChat(c) }}
        onRemoveUser={onRemoveUser}
      />
    </Box>
  );
}

type MessengerProps = {
  token: string, 
  server: Server, 
  onError: (a: JSX.Element) => void,
  onLogOut: () => void,
}

export function Messenger(props: MessengerProps) {
    const [myName, setMyName] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [chats, setChats] = useState<Chat[]>([]);
    const [curChat, setCurChat] = useState<null | Chat>(null);
    const [nowShow, setNowShow] = useState<"chats" | "users">("chats");

    useEffect(() => {
      const f = async () => {
        let users_list = await props.server.getAllUsers();
        setUsers(users_list);
        try {
          let my_chats = await props.server.getMyChats(props.token);
          setChats(my_chats);
        }
        catch (e) {
          props.onError(<Error message={errorToShowed(e)}/>);
          props.onLogOut();
        }
      };
      f();
    }, []);

    const onAddChat = async (title: string) => {
      try {
        const chat = await server.createChat(props.token, title);
        console.log(chats);
        console.log(chat);
        setChats(chats => chats.concat(chat));
      } 
      catch (e) {
        props.onError(<Error message={errorToShowed(e)}/>)
      }
    };

    const onAddUser = async (username: string, ch: Chat) => {
      try {
        const chatMember = await server.addUserToChat(token, ch.id, username);
        setChats(chats => chats.map(c => {
          if (c.id == ch.id) {
            c.members.push(chatMember);
          }
          return c;
        }));
      }
      catch (e) {
        props.onError(<Error message={errorToShowed(e)}/>)
      }
    };

    const onRemoveUser = async (username: string, ch: Chat) => {
      try {
        await server.removeUserFromChat(token, ch.id, username);
        setChats(chats => chats.map(c => {
          if (c.id == ch.id) {
            const idx = c.members.findIndex(m => m.user.name == username);
            c.members.splice(idx, 1);
          }
          return c;
        }));
      }
      catch (e) {
        props.onError(<Error message={errorToShowed(e)}/>)
      }
    };

    const onDeleteChat = async (chat_id: number) => {
      try {
        await server.deleteChat(token, chat_id);
        setCurChat(null);
        setChats(chats => chats.filter(c => c.id != chat_id));
      }
      catch (e) {
        props.onError(<Error message={errorToShowed(e)}/>);
      }
    };

    const onSendTextMessage = async (chat_id: number, text: string) => {
      try {
        const mes = await server.sendTextMessage(token, chat_id, text);
      }
      catch (e) {
        props.onError(<Error message={errorToShowed(e)}/>);
      }
    };

    const onSendFile = async (chat_id: number, file: File) => {
      try {
        const mes = await server.sendFile(token, chat_id, file);
      }
      catch (e) {
        props.onError(<Error message={errorToShowed(e)}/>);
      }
    }

    const onSendImage = async (chat_id: number, file: File) => {
      try {
        const mes = await server.sendImage(token, chat_id, file);
      }
      catch (e) {
        props.onError(<Error message={errorToShowed(e)}/>);
      }
    }

    let {token, server} = props;
    useEffect(() => {
      const onStart = async() => {
        let me = await server.hello(token);
        setMyName(me.name);
      };
      onStart();
    }, [])
    useEffect(() => {
      const receive_updates = async () => {
        try {
          const updates = await server.getUpdates(token);
          updates.forEach(upd => {
            console.log(upd);
            switch (upd.type) {
              case UpdateType.NewChat:
                setChats(chats => chats.concat(upd.chat));
                break;
              case UpdateType.NewMember:
                if (upd.member.user.name != myName) {
                  setChats(chats => chats.map(chat => {
                    if (chat.id == upd.chat.id) {
                      chat.members.push(upd.member);
                    }
                    return chat;
                  }));
                }
                else {
                  setChats(chats => chats.concat(upd.chat))
                }
                break;
              case UpdateType.NewMessage:
                setChats(chats => chats.map(chat => {
                  if (chat.id == upd.chat_id) {
                    chat.messages.push(upd.message);
                  }
                  return chat;
                }));
                break;
              case UpdateType.NewOnlineUser:
                setUsers(users => users.map(user => {
                  if (user.name == upd.username) {
                    user.isOnline = true;
                  }
                  return user;
                }));
                break;
              case UpdateType.NewUser:
                setUsers(users => users.concat(upd.user));
                break;
              case UpdateType.RemoveChat:
                setChats(chats => {
                  const idx = chats.findIndex(chat => chat.id == upd.chat_id);
                  if (idx != -1) {
                    chats.splice(idx, 1);
                  }
                  return chats;
                });
                break;
              case UpdateType.RemoveMember:
                if (upd.member_username == myName) {
                  setChats(chats => {
                    const idx = chats.findIndex(chat => chat.id == upd.chat_id);
                    chats.splice(idx, 1);
                    return chats;
                  });
                }
                else {
                  setChats(chats => chats.map(chat => {
                    if (chat.id == upd.chat_id) {
                      const idx = chat.members.findIndex(m => m.user.name == upd.member_username);
                      if (idx != -1) {
                        chat.members.splice(idx, 1);
                      }
                    }
                    return chat;
                  }));
                }
                break;
              case UpdateType.RemoveOnlineUser:
                setUsers(users => users.map(user => {
                  if (user.name == upd.username) {
                    user.isOnline = false;
                  }
                  return user;
                }));
                break;
            }
          }); 
        }
        catch (e) {
          props.onError(<Error message={errorToShowed(e)}/>);
        }
      }
      const timer_id = setInterval(receive_updates, 500);
      return () => {
        clearInterval(timer_id);
      }
    }, [props, myName]);

    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Box flexGrow="1">
              <Typography variant="h6" noWrap>
                Hello, {myName}!
              </Typography>
            </Box>
            <IconButton color="inherit" onClick={() => setNowShow("chats")}>
                <MailIcon />
            </IconButton>
            <IconButton color="inherit" onClick={() => setNowShow("users")}>
                <PeopleIcon />
            </IconButton>
            <LogOutButton onLogOut={props.onLogOut} />
          </Toolbar>
        </AppBar>
        <Box>
          <Box display={nowShow === "users" ? "block" : "none"}>
            <UsersList users={users}/>
          </Box>
          <Box display={nowShow === "chats" ? "flex" : "none"}
            flexDirection="row" height="800px" border="1px rgba(0, 0, 0, 0.12) solid"
          >
            <Box width="200px" height="100%" borderRight="1px rgba(0, 0, 0, 0.12) solid">
              <ButtonAddChat onAdd={onAddChat}/>
              <ChatList chats={chats} onSelectChat={ (chat) => setCurChat(chat) } />
            </Box>
            <Box width="100%" height="100%">
            { 
              curChat == null ? 
              null : 
              <ChatWindow 
                chat={curChat} 
                onAddUser={onAddUser} 
                onDeleteChat={onDeleteChat}
                onRemoveUser={onRemoveUser}
                users={users}
                onSendTextMessage={onSendTextMessage}
                onError={(text) => props.onError(<Error message={text}/>)}
                onSendFile={onSendFile}
                onSendImage={onSendImage}
              /> 
            }
            </Box>
          </Box>
        </Box>
      </div>
    );
}