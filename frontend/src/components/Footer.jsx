import {Component} from "react";

export class Footer extends Component {
    render() {
        return (
            <>
                <footer className="footer fixed-bottom">
                    <div className="container">
                        <div className="text-center p-3">
                            <span>© 2024 Copyright: <a className="text-white" href="https://nostri.ai">nostri.ai</a></span>
                        </div>
                    </div>
                </footer>
            </>
        )
    }
}