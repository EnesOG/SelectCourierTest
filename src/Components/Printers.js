import React from 'react';

const Printers = ({printers, renderClassName, changeDefault}) => printers.map((printer, i) => (
    <div
        className={"" + (renderClassName(printer) ? 'printer-active' : "printer")}
        key={i}
        onClick={() => changeDefault(printer)}
    >
        {printer.name}
    </div>
));

export default Printers;