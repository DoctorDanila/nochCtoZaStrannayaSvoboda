import React, { useRef, useCallback, useEffect } from "react";
import Popup from "../common/Popup/index.jsx";
import {Button, TextInput, Select} from '@gravity-ui/uikit';
import { toaster } from '@gravity-ui/uikit/toaster-singleton-react-18';
import "./style.scss";
import {RangeCalendar} from '@gravity-ui/date-components';
import {dateTimeParse, dateTime} from '@gravity-ui/date-utils';
import config from '/public/config.js';

const PodpiskakaChangePopup = React.forwardRef((props, ref) => {
  const ludishkaEmailRef = React.useRef(null);
    const [errors, setErrors] = React.useState({});
    const [ludishkaNameStatus, setLudishkaNameStatus] = React.useState({});
    const [ludishkaEmailStatus, setLudishkaEmailStatus] = React.useState({});
    const [newDateStart, setNewDateStart] = React.useState(0);
    const [newDateEnd, setNewDateEnd] = React.useState(0);
    const [ludishkaEmailValue, setLudishkaEmailValue] = React.useState(1);
    const [newOptionsUser, setNewOptionsUser] = React.useState([]);
    const [newOptionsBook, setNewOptionsBook] = React.useState([]);
    const [ludishkaReaderValue, setLudishkaReaderValue] = React.useState([]);
    const [ludishkaBookValue, setLudishkaBookValue] = React.useState([]);
    const [ludishkaReaderStatus, setLudishkaReaderStatus] = React.useState([]);
    const [ludishkaBookStatus, setLudishkaBookStatus] = React.useState([]);
  let id = props.id || null;
  const handleGetData = useCallback((id) => {
    fetch(`${config.baseURL}/subscription/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      console.log("response", response);
      return response.json();
    }).then((dt) => {
      console.log("data", dt);
      setNewDateStart(dt.issueDate);
      setNewDateEnd(dt.returnDate);
      setLudishkaEmailValue(dt.status);
      toaster.add({
        name: 'up',
        title: 'Получили информацию о людишке',
        theme: 'info'
      });
    }).catch(err => {
      console.log(err);
    })
    fetch(`${config.baseURL}/book?fields=id,title`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        console.log("response", response);
        return response.json();
    }).then((dt) => {
        console.log("data", dt.data);
        const filtered = dt.data.filter((item) => item.id !== null);

        // Форматируем дату
        const formattedData = filtered.map(item => ({
            ...item,
            value: item.id,
            content: item.title,
        }));

        setNewOptionsBook(formattedData);
    }).catch(err => console.log(err))
    fetch(`${config.baseURL}/reader?fields=id,email`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        console.log("response", response);
        return response.json();
    }).then((dt) => {
        console.log("data", dt.data);
        const filtered = dt.data.filter((item) => item.id !== null);

        // Форматируем дату
        const formattedData = filtered.map(item => ({
            ...item,
            value: item.id,
            content: item.email,
        }));

        setNewOptionsUser(formattedData);
    }).catch(err => console.log(err))
  }, []);

  useEffect(() => {
    handleGetData(id);
  }, [id]);

  return (
    <>
    <Popup ref={ref} title="Изменение информации" {...props}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
          <RangeCalendar onUpdate={(e) => {setNewDateStart(e.start._timestamp); setNewDateEnd(e.end._timestamp);}} validationState={ludishkaNameStatus} errorMessage={errors.ludishkaName} view="normal" size='l' />
        </div>
        <Select onUpdate={(e) => setLudishkaEmailValue(e[0])} ref={ludishkaEmailRef} validationState={ludishkaEmailStatus} errorMessage={errors.ludishkaEmail} view="normal" size='l' placeholder="Статус"
        options={[
          {value: 0, content: 'Завершён'},
          {value: 1, content: 'Действителен'},
        ]} />
        <Select onUpdate={(e) => setLudishkaReaderValue(e[0])} validationState={ludishkaReaderStatus} errorMessage={errors.ludishkaReader} view="normal" size='l' placeholder="Читатель"
        options={newOptionsUser} />
        <Select onUpdate={(e) => setLudishkaBookValue(e[0])} validationState={ludishkaBookStatus} errorMessage={errors.ludishkaBook} view="normal" size='l' placeholder="Книжонка"
        options={newOptionsBook} />
        <Button view="outlined-info" size="l" onClick={() => {
            console.log(newDateStart, " - ", newDateEnd, " ", ludishkaEmailValue);
            const validationErrors = {};
            if (newDateStart === undefined  || newDateEnd === undefined ) {
              validationErrors.ludishkaName = 'Нужно выбрать дату';
              setLudishkaNameStatus("invalid");
            } else {
              setLudishkaNameStatus("normal");
              delete validationErrors.ludishkaName;
            }
            setErrors(validationErrors);
            if (Object.keys(validationErrors).length === 0) {
                fetch(`${config.baseURL}/subscription/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      issueDate: new Date(newDateStart),
                      returnDate: new Date(newDateEnd),
                      status: ludishkaEmailValue.toString(),
                      reader: ludishkaReaderValue ? ludishkaReaderValue : null,
                      book: ludishkaBookValue ? ludishkaBookValue : null
                    })
                }).then((response) => {
                    console.log("response", response);
                    if (response.status === 200 && response.ok) {
                        toaster.add({
                            name: 'success',
                            title: 'Подписка успешно добавлена',
                            theme: 'success'
                        })
                        ref.current.handleClose();
                        setRefresh_Flag(!refresh_flag);
                    } else {
                        toaster.add({
                            name: 'error',
                            title: 'Не удалось добавить подписку, попробуйте позже',
                            theme: 'danger'
                        })
                    }
                    return response.json();
                }).catch(err => console.log(err))
            }
        }}>Добавить подписку</Button>
    </Popup>
    </>
  );
});

export default PodpiskakaChangePopup;
