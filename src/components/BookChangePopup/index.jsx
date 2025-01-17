import React, { useRef, useCallback, useEffect } from "react";
import Popup from "../common/Popup/index.jsx";
import {Button, TextInput} from '@gravity-ui/uikit';
import { toaster } from '@gravity-ui/uikit/toaster-singleton-react-18';
import "./style.scss";

const BookChangePopup = React.forwardRef((props, ref) => {
  const bookNameRef = React.useRef(null);
  const bookYearRef = React.useRef(null);
  const [errors, setErrors] = React.useState({});
  const [bookNameStatus, setBookNameStatus] = React.useState({});
  const [bookYearStatus, setBookYearStatus] = React.useState({});
  const [bookNameValue, setBookNameValue] = React.useState('');
  const [bookYearValue, setBookYearValue] = React.useState('');
  let id = props.id || null;
  const handleGetData = useCallback((id) => {
    fetch(`http://26.47.175.40:5000/api/book/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      console.log("response", response);
      return response.json();
    }).then((dt) => {
      console.log("data", dt);
      setBookNameValue(dt.Title);
      setBookYearValue(dt.Year);
      toaster.add({
        name: 'up',
        title: 'Получили информацию о книге',
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
        <TextInput onChange={(e)=>setBookNameValue(e.target.value)} ref={bookNameRef} value={bookNameValue} validationState={bookNameStatus} errorMessage={errors.bookName} view="normal" size='l' placeholder="Название" />
        <TextInput onChange={(e)=>setBookYearValue(e.target.value)} ref={bookYearRef} value={bookYearValue} validationState={bookYearStatus} errorMessage={errors.bookYear} view="normal" size='l' placeholder="Год издания" />
        <Button view="outlined-info" size="l" onClick={() => {
            let bookName = bookNameRef.current.children[0].children[0].value;
            let bookYear = bookYearRef.current.children[0].children[0].value;
            const regExp = /^[а-яА-ЯёЁ\s]{2,255}$/;
            const regExp2 = /^[0-9]{4}$/;
            const validationErrors = {};
            if (!regExp.test(bookName)) {
              validationErrors.bookName = 'Название книги должно содержать от 2 до 255 русских символов';
              setBookNameStatus("invalid");
            } else {
              setBookNameStatus("normal");
              delete validationErrors.bookName;
            }
            if (!regExp2.test(bookYear)) {
              validationErrors.bookYear = 'Год не должен быть пуст и должен быть похож на год';
              setBookYearStatus("invalid");
            } else {
              setBookYearStatus("normal");
              delete validationErrors.bookYear;
            }
            setErrors(validationErrors);
            if (Object.keys(validationErrors).length === 0) {
              fetch(`http://26.47.175.40:5000/api/book/${id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    Title: bookName,
                    Year: bookYear
                  })
              }).then((response) => {
                  console.log("response", response);
                  if (response.status === 200 && response.ok) {
                    toaster.add({
                      name: 'update',
                      title: 'Информация о книге обновлена',
                      theme: 'success'
                    });
                    ref.current.handleClose();
                  } else {
                    toaster.add({
                      name: 'update',
                      title: 'Не удалось обновить информацию о книге, попробуйте позже',
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

export default BookChangePopup;
