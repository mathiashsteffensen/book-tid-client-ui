import { Card, Button } from 'react-bootstrap'

import React from 'react'

export default function Slider({title, handleClick, isOpen, children, disabled = false}) {
    return (
        <Card className="mt-2">
            <Card.Header style={{padding: 0}}>
              <Button disabled={disabled} variant="primary" onClick={handleClick} style={{width: '100%'}}>
                {title}
              </Button>
            </Card.Header>
            <Card.Body className={`slider ${isOpen ? 'slide-down' : 'slide-up'}`}>
              {children}
            </Card.Body>
        </Card>
    )
}
