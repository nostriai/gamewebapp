import {Header} from "./Header.jsx";
import {Footer} from "./Footer.jsx";
import {Outlet} from "react-router-dom";
import {Component} from "react";

export class Layout extends Component {
    render() {
        return (
            <>
                <Header />
                <Outlet />
                <Footer />
            </>
        )
    }
}