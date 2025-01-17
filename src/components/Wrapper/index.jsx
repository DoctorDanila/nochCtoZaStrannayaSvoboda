import React, {useEffect} from 'react';
import block from 'bem-cn-lite';
import { Link } from 'react-router-dom';
import {BookOpen,Person,Star} from '@gravity-ui/icons';
import {Button, Icon, ThemeProvider} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';
import factum from '/Script.svg';
import './style.scss';

const b = block('wrapper');

const DARK = 'dark';
const LIGHT = 'light';
const DEFAULT_THEME = DARK;

export default function Wrapper({children}) {
    const [theme, setTheme] = React.useState(localStorage.getItem('theme') || DEFAULT_THEME);
    const isDark = theme === DARK;

    useEffect(() => {
        if (localStorage.getItem('theme') !== theme) localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <ThemeProvider theme={theme}>
            <div className={b()}>
                <nav className={b('nav-container')}>
                    <div className={b('logo')} title='Digital agency | Лучшие по факту!'>
                        <Link to="/">
                            <img src={factum} alt="Factum" /> 
                        </Link>
                    </div>
                    <div className={b('navigation')}>
                        <div className="nav-btn">
                            <Icon data={BookOpen} />
                            <Link to="/book">Книги</Link>
                        </div>
                        <div className="nav-btn">
                            <Icon data={Person} />
                            <Link to="/reader">Читатели</Link>
                        </div>
                        <div className="nav-btn">
                            <Icon data={Star} />
                            <Link to="/subscription">Подписки</Link>
                        </div>
                    </div>
                    <div className={b('theme-button')}>
                        <Button
                            size="l"
                            view="outlined"
                            onClick={() => {
                                setTheme(isDark ? LIGHT : DARK);
                            }}
                        >
                            <Icon data={isDark ? Sun : Moon} />
                        </Button>
                    </div>
                </nav>
                <div className={b('layout')}>
                    <div className={b('content')}>{children}</div>
                </div>
                <footer className={b('footer-container')}>
                    <p>&copy; 2024 Script | Digital Agency</p>
                </footer>
            </div>
        </ThemeProvider>
    );
}