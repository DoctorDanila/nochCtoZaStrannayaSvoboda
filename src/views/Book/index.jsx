import React, {useState, useEffect} from "react";
import {Table, withTableActions, Button, TextInput} from '@gravity-ui/uikit';
import {Pencil,TrashBin,Eye, ChevronsExpandUpRight, ChevronsCollapseUpRight} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import BookChangePopup from "../../components/BookChangePopup";
import './style.scss';
import { toaster } from '@gravity-ui/uikit/toaster-singleton-react-18';
import config from '/public/config.js';

const MyTable = withTableActions(Table);

export default function Book() {
    const [data, setData] = React.useState([]);
    const [refresh_flag, setRefresh_Flag] = React.useState(false);
    const [fullscr, setFullScr] = React.useState('min');
    const bookNameRef = React.useRef(null);
    const bookYearRef = React.useRef(null);
    const [errors, setErrors] = React.useState({});
    const [bookNameStatus, setBookNameStatus] = React.useState({});
    const [bookYearStatus, setBookYearStatus] = React.useState({});
    const [open, setOpen] = React.useState(false);
    const [bookId, setBookId] = React.useState(null);
    const popupRef = React.useRef(null);
    useEffect(() => {
        console.log('refresh_flag', refresh_flag);
        fetch(`${config.baseURL}/book`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            console.log("response", response);
            return response.json();
        }).then((dt) => {
            console.log("data", dt.data);
            setData(dt.data)
        }).catch(err => console.log(err))
    }, [refresh_flag, open]);
    useEffect(() => {
        if (fullscr === 'full') {
            document.querySelector(".table-box").classList.add('fullscr');
            document.querySelector(".creation-box").classList.add('fullscr');
        } else {
            document.querySelector(".table-box").classList.remove('fullscr');
            document.querySelector(".creation-box").classList.remove('fullscr');
        }
    }, [fullscr]);
    const getRowActions = (rowData) => {
        return [
            {
                text: 'Исправить',
                icon: <Icon data={Pencil} size={14} />,
                handler: () => {
                    setBookId(rowData.id);
                    setOpen(true);
                },
            },
            {
                text: 'Удалить',
                icon: <Icon data={TrashBin} size={14} />,
                handler: () => {
                    fetch(`${config.baseURL}/book/${rowData.id}`, {
                        method: 'DELETE'
                    }).then((response) => {
                        console.log("response", response);
                        if (response.status === 204 || response.ok) {
                            toaster.add({
                                name: 'delete',
                                title: 'Книга удалена',
                                theme: 'success'
                            });
                            setRefresh_Flag(!refresh_flag);
                        } else {
                            toaster.add({
                                name: 'delete',
                                title: 'Не удалось удалить книгу, попробуйте позже',
                                theme: 'danger'
                            });
                        }
                        return response.json();
                    }).catch(err => console.log(err))
                },
                theme: 'danger',
            },
        ];
    };
    const columns = [{id: 'id'}, {id: 'title'}, {id: 'year'}];
    return (
        <>
            <BookChangePopup ref={popupRef} open={open} id={bookId} onClose={() => setOpen(false)} />
            <div className="row">
                <div className="table-box box">
                    <div className="table-options-wrapper">
                        <h3>
                            Списог книг
                        </h3>
                        <div className="table-options" onClick={() => setFullScr(fullscr === 'full' ? 'min' : 'full')}>
                            <Icon data={fullscr === 'min' ? ChevronsExpandUpRight : ChevronsCollapseUpRight} size={18}/>
                        </div>
                    </div>
                    <MyTable data={data} columns={columns} getRowActions={getRowActions} verticalAlign="middle" width="max" emptyMessage="Данных больше нет ¯\_(ツ)_/¯"/>
                </div>
                <div className="creation-box box">
                    <div className="table-options-wrapper">
                        <h3>
                            Добавить книгу
                        </h3>
                        <div className="table-options" onClick={() => setFullScr(fullscr === 'full' ? 'min' : 'full')}>
                            <Icon data={fullscr === 'min' ? ChevronsExpandUpRight : ChevronsCollapseUpRight} size={18}/>
                        </div>
                    </div>
                    <TextInput ref={bookNameRef} validationState={bookNameStatus} errorMessage={errors.bookName} view="normal" size='l' placeholder="Название" />
                    <TextInput ref={bookYearRef} validationState={bookYearStatus} errorMessage={errors.bookYear} view="normal" size='l' placeholder="Год издания" />
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
                            fetch(`${config.baseURL}/book`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    title: bookName,
                                    year: bookYear
                                })
                            }).then((response) => {
                                console.log("response", response);
                                if ((response.status === 201 || response.status === 200) && response.ok) {
                                    toaster.add({
                                        name: 'cr',
                                        title: 'Книга добавлена',
                                        theme: 'success'
                                    })
                                    setRefresh_Flag(!refresh_flag);
                                } else {
                                    toaster.add({
                                        name: 'cr',
                                        title: 'Не удалось добавить книгу, попробуйте позже',
                                        theme: 'danger'
                                    });
                                }
                                return response.json();
                            }).catch(err => console.log(err))
                        }
                    }}>Добавить кинигу</Button>
                </div>
            </div>
        </>
    )
}