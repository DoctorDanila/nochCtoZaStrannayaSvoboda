import React, { useRef, useCallback, useEffect } from "react";
import Popup from "../common/Popup/index.jsx";
import {Button, TextInput} from '@gravity-ui/uikit';
import { toaster } from '@gravity-ui/uikit/toaster-singleton-react-18';
import "./style.scss";

const LudishkaChangePopup = React.forwardRef((props, ref) => {
  const ludishkaNameRef = React.useRef(null);
  const ludishkaSurnameRef = React.useRef(null);
  const ludishkaEmailRef = React.useRef(null);
  const [errors, setErrors] = React.useState({});
  const [ludishkaNameStatus, setLudishkaNameStatus] = React.useState({});
  const [ludishkaSurnameStatus, setLudishkaSurnameStatus] = React.useState({});
  const [ludishkaEmailStatus, setLudishkaEmailStatus] = React.useState({});
  const [ludishkaNameValue, setLudishkaNameValue] = React.useState('');
  const [ludishkaSurnameValue, setLudishkaSurnameValue] = React.useState('');
  const [ludishkaEmailValue, setLudishkaEmailValue] = React.useState('');
  let id = props.id || null;
  const handleGetData = useCallback((id) => {
    fetch(`http://localhost:5000/api/reader/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      console.log("response", response);
      return response.json();
    }).then((dt) => {
      console.log("data", dt);
      setLudishkaNameValue(dt.Name);
      setLudishkaSurnameValue(dt.Surname);
      setLudishkaEmailValue(dt.Email);
      toaster.add({
        name: 'up',
        title: 'Получили информацию о людишке',
        theme: 'info'
      });
    }).catch(err => {
      console.log(err);
    })
  }, []);

  useEffect(() => {
    handleGetData(id);
  }, [id]);

  return (
    <>
    <Popup ref={ref} title="Изменение информации" {...props}>
        <TextInput onChange={(e)=>setLudishkaNameValue(e.target.value)} ref={ludishkaNameRef} value={ludishkaNameValue} validationState={ludishkaNameStatus} errorMessage={errors.ludishkaName} view="normal" size='l' placeholder="Имя" />
        <TextInput onChange={(e)=>setLudishkaSurnameValue(e.target.value)} ref={ludishkaSurnameRef} value={ludishkaSurnameValue} validationState={ludishkaSurnameStatus} errorMessage={errors.ludishkaSurname} view="normal" size='l' placeholder="Фамилия" />
        <TextInput onChange={(e)=>setLudishkaEmailValue(e.target.value)} ref={ludishkaEmailRef} value={ludishkaEmailValue} validationState={ludishkaEmailStatus} errorMessage={errors.ludishkaEmail} view="normal" size='l' placeholder="Почта" />
        <Button view="outlined-info" size="l" onClick={() => {
            let ludishkaName = ludishkaNameRef.current.children[0].children[0].value;
            let ludishkaSurname = ludishkaSurnameRef.current.children[0].children[0].value;
            let ludishkaEmail = ludishkaEmailRef.current.children[0].children[0].value;
            const regExp = /^[а-яА-ЯёЁ\s]{2,32}$/;
            const regExp2 = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
            const validationErrors = {};
            if (!regExp.test(ludishkaName)) {
              validationErrors.ludishkaName = 'Название людишки должно содержать от 2 до 32 русских символов';
              setLudishkaNameStatus("invalid");
            } else {
              setLudishkaNameStatus("normal");
              delete validationErrors.ludishkaName;
            }
            if (!regExp.test(ludishkaSurname)) {
              validationErrors.ludishkaSurname = 'Фамилия людишки должна содержать от 2 до 32 русских символов';
              setLudishkaSurnameStatus("invalid");
            } else {
              setLudishkaSurnameStatus("normal");
              delete validationErrors.ludishkaSurname;
            }
            if (!regExp2.test(ludishkaEmail)) {
              validationErrors.ludishkaEmail = 'Email должен быть правильным, а не вот это вот вот';
              setLudishkaEmailStatus("invalid");
            } else {
              setLudishkaEmailStatus("normal");
              delete validationErrors.ludishkaEmail;
            }
            setErrors(validationErrors);
            if (Object.keys(validationErrors).length === 0) {
              fetch(`http://localhost:5000/api/reader/${id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    Name: ludishkaName,
                    Surname: ludishkaSurname,
                    Email: ludishkaEmail
                  })
              }).then((response) => {
                  console.log("response", response);
                  if (response.status === 200 && response.ok) {
                    toaster.add({
                      name: 'update',
                      title: 'Информация о людишке обновлена',
                      theme: 'success'
                    });
                    ref.current.handleClose();
                  } else {
                    toaster.add({
                      name: 'update',
                      title: 'Не удалось обновить информацию о людишке, попробуйте позже',
                      theme: 'danger'
                    });
                  }
                  return response.json();
              }).catch(err => console.log(err))
            }
        }}>Применить изменения</Button>
    </Popup>
    </>
  );
});

export default LudishkaChangePopup;
