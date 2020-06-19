import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { MemoryServer, User, ServerError, BackendServer } from './requests';
import { TextField, Button, Container, ButtonGroup, Snackbar, IconButton } from '@material-ui/core';
import { useCookies } from 'react-cookie';
import { Cookie, CookieSetOptions } from 'universal-cookie';
import { Messenger } from './messenger';

let server = new BackendServer("");
/*server.registration("1", "1");
server.registration("2", "2");
server.registration("3", "3");
server.authorization("1", "1");
server.createChat("1", "1");*/


function changeData(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, f: React.Dispatch<React.SetStateAction<string>>): void {
  e.preventDefault();
  f(e.currentTarget.value);
}

function RegisterForm(props: { visibility: boolean }): any {
  const [username, changeUsername] = useState("");
  const [password, changePassword] = useState("");
  const [password2, changePassword2] = useState("");
  const [error, changeError] = useState("");
  const register_func = async (e: any) => {
    e.preventDefault();
    switch (password === password2) {
      case false:
        changeError("Пароли не совпадают!");
        return;
    };
    try {
      let resp = await server.registration(username, password);
      alert("Успешно!");
    }
    catch (e) {
      if (e instanceof ServerError) {
        changeError(e.errorString());
      }
      else {
        changeError("Неизвестная ошибка. Попробуйте еще раз.");
      }
    }
  };
  return (
    <div hidden={!props.visibility}>
      <h2>Register:</h2>
      <form autoComplete="off">
        <div>
          <TextField required name="username" label="Username" 
            onChange={(e) => changeData(e, changeUsername)} 
            value={username} 
          />
        </div>
        <div>
          <TextField required type="password" name="password" label="Password" 
            onChange={(e) => changeData(e, changePassword)} 
            value={password}
          />
        </div>
        <div>
          <TextField required type="password" name="password2" label="Confirm Password" 
            onChange={(e) => changeData(e, changePassword2)} 
            value={password2}
          />
        </div>
        <Button variant="contained" color="primary" onClick={register_func}>Register</Button>
      </form>
      {error}
    </div>
  );
}

type AuthFormProps = { 
  visibility: boolean,
  onSubmit: (username: string, password: string) => void,
};

function AuthForm(props: AuthFormProps): any {
  const [username, changeUsername] = useState("");
  const [password, changePassword] = useState("");
  const auth_func = async (e: any) => {
    e.preventDefault();
    props.onSubmit(username, password);
  };
  return (
    <div hidden={!props.visibility}>
      <h2>Authorization:</h2>
      <form autoComplete="off">
        <div>
          <TextField required name="username" label="Username" 
            onChange={(e) => changeData(e, changeUsername)} 
            value={username} 
          />
        </div>
        <div>
          <TextField required type="password" name="password" label="Password" 
            onChange={(e) => changeData(e, changePassword)} 
            value={password}
          />
        </div>
        <Button variant="contained" color="primary" onClick={auth_func}>Authorization</Button>
      </form>
    </div>
  );
}

function AuthPage(props: { onSubmit: (username: string, password: string) => void }) {
  let [showRegister, changeVisibility] = useState(true);
  return (
    <div>
      <ButtonGroup>
        <Button onClick={() => changeVisibility(true)}>Registration</Button>
        <Button onClick={() => changeVisibility(false)}>Authorization</Button>
      </ButtonGroup>
      <RegisterForm visibility={showRegister} />
      <AuthForm visibility={!showRegister} onSubmit={props.onSubmit} />
    </div>
  );
}

export function Error(props: {message: string}) {
  const [open, setOpen] = useState(true);

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };
  return (
    <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        message={props.message}
        action={
          <React.Fragment>
            <Button color="secondary" size="small" onClick={handleClose}>
              ОК
            </Button>
          </React.Fragment>
        }
      />
  );
}

function App() {
  const [message, setMessage] = useState(<div></div>);
  const [cookie, setCookie, removeCookie] = useCookies(['token']);
  const [token, setToken] = useState<string | null>(cookie['token'] || null);

  const checkUserAuth = (username: string, password: string) => {
    return server.authorization(username, password)
      .then(resp => {
        setToken(resp.token);
        setCookie("token", resp.token);
      })
      .catch(e => setMessage(<Error message={errorToShowed(e)}/>))
  };

  if (token == null) {
    return (
      <Container>
          <AuthPage onSubmit={checkUserAuth} />
          {message}
      </Container>
    );
  }
  else {
    const onLogOut = () => {
      removeCookie('token');
      setToken(null);
    }
    return (
      <Container>
        <Messenger token={token} server={server} onError={(s) => setMessage(s)} onLogOut={onLogOut} />
        {message}
      </Container>
    )
  }
}

export function errorToShowed(e: any): string {
  if (e instanceof ServerError) {
    return (e as ServerError).errorString();
  }
  else {
    console.log(e);
    return "Неизвестная ошибка.";
  }
}

export default App;
