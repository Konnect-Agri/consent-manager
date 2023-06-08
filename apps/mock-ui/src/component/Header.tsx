
import React, { FC, useEffect, useState } from 'react'
import { Container, Navbar, Nav, } from 'react-bootstrap';

import { LinkContainer } from 'react-router-bootstrap'

const Header: FC = () => {
    const [showLogout, setShowLogout] = useState<boolean>();
    useEffect(() => {
        if (window.location.pathname == "/")
            setShowLogout(false)
        else
            setShowLogout(true);
    }, [window.location.pathname])
    return (
        <header>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <LinkContainer to="">
                        <Navbar.Brand>Krushak Odisha</Navbar.Brand>
                    </LinkContainer>
                    {showLogout && <LinkContainer to="/" onClick={() => { localStorage.clear() }}>
                        <Navbar.Brand>Logout</Navbar.Brand>
                    </LinkContainer>}
                </Container>
            </Navbar>
        </header>
    )
}

export default Header

