import React, {useEffect} from 'react'
import './App.css'
import { Route, Routes, useNavigate } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Wrapper from './components/Wrapper';
import Book from './views/Book';
import Reader from './views/Reader';
import Subscription from './views/Subscription';
import PageTitle from './components/common/PageTitle.jsx';

const Navigator = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/book');
  }, []);

  return null;
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
      <Router>
        <Wrapper>
          <Routes>
            <Route
              index
              element={
                <>
                  <PageTitle title="Главная | Ночные библиотекари" />
                  <Navigator />
                </>
              }
            />
            <Route
              path="/book"
              element={
                <>
                  <PageTitle title="Книги | Ночные библиотекари" />
                  <Book />
                </>
              }
            />
            <Route
              path="/reader"
              element={
                <>
                  <PageTitle title="Читатели | Ночные библиотекари" />
                  <Reader />
                </>
              }
            />
            <Route
              path="/subscription"
              element={
                <>
                  <PageTitle title="Подписки | Ночные библиотекари" />
                  <Subscription />
                </>
              }
            />
          </Routes>
        </Wrapper>
      </Router>
    </QueryClientProvider>
    </>
  )
}
