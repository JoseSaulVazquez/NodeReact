import { Route, Routes } from 'react-router'
import IndexPage from '../pages/IndexPage';
import ExamplePage from "../pages/ExamplePage";

export default function AppRouter(){
    return (
        <>
            <Routes>
                <Route path='/' element={<IndexPage/>}/>
                <Route path='/example' element={<ExamplePage/>}/>
            </Routes>
        </>
    )
}