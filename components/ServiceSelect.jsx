import {Form} from 'react-bootstrap'

import React from 'react'

export default function ServiceSelect({catsAndServices, handleChange, selected, hideServiceDuration, hideServicePrice}) 
{
    return (
        <Form.Group>
            <Form.Control onChange={handleChange} value={selected} id="select-service" as="select" custom>
                <option value="default">-- Vælg en service --</option>
                {catsAndServices.map(catAndServices =>
                {
                    if (catAndServices.category.name !== 'Uden Kategori') return <optgroup key={catAndServices.category._id} label={catAndServices.category.name}>
                        {catAndServices.services.map(service => <option value={JSON.stringify(service)} key={service._id}>{service.name} - {!hideServiceDuration && `${service.minutesTaken}min.`} - {!hideServicePrice && `${service.cost}kr.`}</option>)}
                    </optgroup>
                })}
                {catsAndServices.find(cat => cat.category.name === 'Uden Kategori').services.map(service => <option value={JSON.stringify(service)} key={service._id}>{service.name} - {!hideServiceDuration && `${service.minutesTaken}min.`} - {!hideServicePrice && `${service.cost}kr.`}</option>)}
            </Form.Control>
        </Form.Group>
        
    )
}
