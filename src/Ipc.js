import React from 'react'
import openSocket from 'socket.io-client';
import './ipc.css';
import Printers from "./Components/Printers";
import { Helmet } from 'react-helmet'
const ipc = window.ipcRenderer;

class Ipc extends React.Component {
    state = {
        printers: [],
        defaultPrinter: {},
        numPages: 1,
        port: 5000,
    };

    setDefaultPrinter() {
        const {printers} = this.state;
        console.log(printers);
        const defaultPrinter = printers.find(el => el.isDefault === true);
        this.setState({defaultPrinter})
    }

    renderClassName(printer) {
        return this.state.defaultPrinter === printer;
    }

    componentWillUnmount() {
        ipc.removeListener('sendPrinters', this.handlePrinters.bind(this))
    }

    changeDefault(printer) {
        this.setState({defaultPrinter: printer})
    }

    handlePrinters(event, data) {
        this.setState({printers: data},()=>{
            this.setDefaultPrinter();
        })

    }

    componentDidMount() {
        ipc.send('getPrinters');
        ipc.on('sendPrinters', this.handlePrinters.bind(this));
        this.serverStart();

    }

    printPDF(fileName) {
            let res = this.state.defaultPrinter;
            res.fileName = fileName;
            ipc.send('test',res);
    }

    serverStart() {
        ipc.send('serverStart' , this.state.port);
        this.openSocket();

    }

    openSocket() {
        const socket = openSocket(`http://localhost:${this.state.port}`);
        socket.on('filePrinter', fileName => this.printPDF(fileName))

    }

    render() {
        return (
            <>
                <Helmet title={'Select Courier'}/>
                <div className='printers'>
                    <Printers renderClassName={this.renderClassName.bind(this)} changeDefault={this.changeDefault.bind(this)} printers={this.state.printers}/>
                </div>
            </>
        )
    }

};

export default Ipc;