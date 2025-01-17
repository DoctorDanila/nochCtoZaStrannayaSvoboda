import React, {useState, useEffect} from "react";
import {Table, withTableActions, Button, TextInput, Select} from '@gravity-ui/uikit';
import {Pencil,TrashBin,Eye, ChevronsExpandUpRight, ChevronsCollapseUpRight} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import PodpiskakaChangePopup from "../../components/PodpiskakaChangePopup";
import './style.scss';
import { toaster } from '@gravity-ui/uikit/toaster-singleton-react-18';
import {RangeCalendar} from '@gravity-ui/date-components';
import {dateTimeParse, dateTime} from '@gravity-ui/date-utils';

const MyTable = withTableActions(Table);

export default function Subscription() {
    const [data, setData] = React.useState([]);
    const [refresh_flag, setRefresh_Flag] = React.useState(false);
    const [fullscr, setFullScr] = React.useState('min');
    const ludishkaEmailRef = React.useRef(null);
    const [errors, setErrors] = React.useState({});
    const [ludishkaNameStatus, setLudishkaNameStatus] = React.useState({});
    const [ludishkaEmailStatus, setLudishkaEmailStatus] = React.useState({});
    const [newDateStart, setNewDateStart] = React.useState(0);
    const [newDateEnd, setNewDateEnd] = React.useState(0);
    const [ludishkaEmailValue, setLudishkaEmailValue] = React.useState('Действителен');
    const [open, setOpen] = React.useState(false);
    const [ludishkaId, setLudishkaId] = React.useState(null);
    const popupRef = React.useRef(null);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
        const year = date.getFullYear();
        
        return `${day}.${month}.${year}`; // Формат: DD.MM.YYYY
    };

    useEffect(() => {
        fetch(`http://26.47.175.40:5000/api/subscription`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            console.log("response", response);
            return response.json();
        }).then((dt) => {
            console.log("data", dt);
            const filtered = dt.filter((item) => item.SubscriptionId !== null);

            // Форматируем дату
            const formattedData = filtered.map(item => ({
                ...item,
                IssueDate: formatDate(item.IssueDate), // Форматируем дату
                ReturnDate: formatDate(item.ReturnDate) // Форматируем дату
            }));

            setData(formattedData);
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
                    setLudishkaId(rowData.SubscriptionId);
                    setOpen(true);
                },
            },
            {
                text: 'Удалить',
                icon: <Icon data={TrashBin} size={14} />,
                handler: () => {
                    fetch(`http://26.47.175.40:5000/api/subscription/${rowData.SubscriptionId}`, {
                        method: 'DELETE'
                    }).then((response) => {
                        console.log("response", response);
                        if (response.status === 200 && response.ok) {
                            toaster.add({
                                name: 'success',
                                title: 'Подписка успешно удалена',
                                theme: 'success'
                            })
                            setRefresh_Flag(!refresh_flag);
                        } else {
                            toaster.add({
                                name: 'error',
                                title: 'Не удалось удалить подписку, попробуйте позже',
                                theme: 'danger'
                            })
                        }
                        return response.json();
                    }).catch(err => console.log(err))
                },
                theme: 'danger',
            },
        ];
    };
    const columns = [{id: 'SubscriptionId'}, {id: 'IssueDate'}, {id: 'ReturnDate'}, {id: 'Status'}];
    return (
        <>
            <PodpiskakaChangePopup ref={popupRef} open={open} id={ludishkaId} onClose={() => setOpen(false)} />
            <div className="row">
                <div className="table-box box">
                    <div className="table-options-wrapper">
                        <h3>
                            Список подписок
                        </h3>
                        <div className="table-options" onClick={() => setFullScr(fullscr === 'full' ? 'min' : 'full')}>
                            <Icon data={fullscr === 'min' ? ChevronsExpandUpRight : ChevronsCollapseUpRight} size={18}/>
                        </div>
                    </div>
                    <MyTable data={data} columns={columns} getRowActions={getRowActions} verticalAlign="middle" width="max" emptyMessage="Подписок больше нет ¯\_(ツ)_/¯"/>
                </div>
                <div className="creation-box box">
                    <div className="table-options-wrapper">
                        <h3>
                            Добавить подписку
                        </h3>
                        <div className="table-options" onClick={() => setFullScr(fullscr === 'full' ? 'min' : 'full')}>
                            <Icon data={fullscr === 'min' ? ChevronsExpandUpRight : ChevronsCollapseUpRight} size={18}/>
                        </div>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                        <RangeCalendar onUpdate={(e) => {setNewDateStart(e.start._timestamp); setNewDateEnd(e.end._timestamp);}} validationState={ludishkaNameStatus} errorMessage={errors.ludishkaName} view="normal" size='l' />
                    </div>
                    <Select onUpdate={(e) => setLudishkaEmailValue(e[0])} ref={ludishkaEmailRef} validationState={ludishkaEmailStatus} errorMessage={errors.ludishkaEmail} view="normal" size='l' placeholder="Статус"
                    options={[
                        {value: 'Завершён', content: 'Завершён'},
                        {value: 'Действителен', content: 'Действителен'},
                    ]} />
                    <Button view="outlined-info" size="l" onClick={() => {
                        console.log(newDateStart, " - ", newDateEnd, " ", ludishkaEmailValue);
                        const validationErrors = {};
                        if (newDateStart.length === 0 || newDateEnd.length === 0) {
                            validationErrors.ludishkaName = 'Нужно выбрать дату';
                            setLudishkaNameStatus("invalid");
                        } else {
                            setLudishkaNameStatus("normal");
                            delete validationErrors.ludishkaName;
                        }
                        setErrors(validationErrors);
                        if (Object.keys(validationErrors).length === 0) {
                            fetch(`http://26.47.175.40:5000/api/subscription`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    SubscriptionId: Math.floor(Date.now() / 1000).toString(),
                                    IssueDate: new Date(newDateStart).toISOString(),
                                    ReturnDate: new Date(newDateEnd).toISOString(),
                                    Status: ludishkaEmailValue
                                })
                            }).then((response) => {
                                console.log("response", response);
                                if (response.status === 200 && response.ok) {
                                    toaster.add({
                                        name: 'success',
                                        title: 'Подписка успешно добавлена',
                                        theme: 'success'
                                    })
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
                </div>
            </div>
        </>
    )
}