import React from 'react'

export default function SuccessText({name, date, startTime, endTime, companyName, serviceName}) 
{
    return (
        <div>
            Tak for din booking, {name}
            <br/>
            <br/>
            Vi har registreret din tid d. {date.format('DD/MM-YYYY')}  kl.{startTime.format('H:mm')}{endTime && `-${endTime.format('H:mm')}`} til {serviceName}
            <br/>
            <br/>
            Vi ser frem til dit besøg
            <br/>
            {companyName}
        </div>
    )
}
