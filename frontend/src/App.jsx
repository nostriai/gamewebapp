import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import {Home} from "./components/Home.jsx";
import {Layout} from "./components/Layout.jsx";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
        </Route>
    )
)
function App({routes}) {
    return (
        <>
            <RouterProvider router={router}/>
        </>
    );
}
export default App;