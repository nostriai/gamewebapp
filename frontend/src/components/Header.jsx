import {Component} from "react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {NavbarText} from "react-bootstrap";

export class Header extends Component {
    render() {
        return (
            <>
                <Navbar expand="lg" className="bg-body-tertiary">
                    <Container>
                        <Navbar.Brand href="#home">Nostri.ai checkers</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link href="/">Home</Nav.Link>
                                <Nav.Link href="/turn-history">Turn history</Nav.Link>
                                <Nav.Link href="/training">Training</Nav.Link>
                                <Nav.Link href="/marketplace">Marketplace</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                        <NavbarText>Logged in as: <a href="/profile">{this.props.username ?? 'Anonymous'}</a></NavbarText>
                    </Container>
                </Navbar>
            </>
        )
    }
}