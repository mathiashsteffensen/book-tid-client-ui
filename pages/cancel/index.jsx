import { useState } from 'react'
import Head from 'next/head'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap'

import DoneIcon from '@material-ui/icons/Done';

import Slider from '../../components/Slider'

import {
    getTheme,
    getAppointmentByCancelToken,
    cancelAppointment
} from '../../requests'

export default function Cancel( { title, favicon, error, appointment, businessName, canCancel, cancelToken, domainPrefix, isCancelled } ) 
{
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [success, setSucess] = useState(false)

  const handleCancel = () =>
  {
    setIsLoading(true)
    cancelAppointment(cancelToken, domainPrefix)
      .then((res) =>
      {
        setSucess(res.succes)
      })
      .catch((err) =>
      {
        if (err.response) setSubmitError(err.response.data.msg)
        else setSubmitError('Der skete en fejl med at aflyse din tid')
      })
      .finally(() =>
      {
        setIsLoading(false)
        location.reload()
      })
  }

    return (
        <Container fluid="xl">
            <Head>
                <title>{title}</title>
                <link rel="icon" href={favicon} />
            </Head>

            <Row>
              <Col md={8}>
                <Slider
                  title="Aflys Booking"
                  isOpen
                  disabled
                >
                  { ( !error && isCancelled ) && <Alert className="border-warning" variant="warning">
                    Din tid er aflyst
                  </Alert>}


                  { error && error }

                  { ( !error && canCancel && appointment && !isCancelled ) && <>
                    Du er igang med at aflyse din booking til <strong>{ appointment.service }</strong> hos <strong>{ businessName }</strong> kl. <strong>{ dayjs.utc(appointment.startTime).format('H:mm - ') }{ dayjs.utc(appointment.endTime).format('H:mm D/M/YYYY ') }</strong>
                    <br />
                    Er du sikker på at du vil aflyse din tid?
                    <div className="flex-center mt-2">
                      <Button onClick={handleCancel} className="mx-auto">
                        {  ( !isLoading && !submitError && !success ) && 'Bekræft Aflysning' }

                        { isLoading && <Spinner animation="border" /> }

                        { ( !isLoading && !submitError && success ) && <DoneIcon /> }
                      </Button>

                      { ( !isLoading && ( success || submitError ) ) && <span className={ success ? 'text-success mt-2' : 'text-danger mt-2' } >{ success || submitError }</span>}
                    </div>
                  </> }

                  { ( !error && appointment && !canCancel && !isCancelled ) && <>
                    Det er desværre ikke længere muligt at aflyse denne booking, kontakt venligst <strong>{ businessName }</strong>
                  </> }

                  { ( !error && !appointment ) && <>
                    Vi kunne ikke finde din booking, tjek venligst at du har klikket på det korrekte link, dette betyder ikke at din booking er aflyst.
                  </> }

                </Slider>
              </Col>

              <Col>
                <Slider
                  title={title}
                  isOpen
                  disabled
                >
                  <img style={{maxWidth: '200px'}} src={favicon} alt="logo"/>
                </Slider>
              </Col>  
            </Row> 
        </Container>
        
    )
}

export async function getServerSideProps( { req, query } )
{
  const subdomain = req.headers.host.split('.')[0]
  
  try {
    const theme = await getTheme(subdomain)

    const cancelToken = query.token

    const appointment = await getAppointmentByCancelToken(cancelToken, subdomain)
  
    console.log(appointment, theme);

    return {
      props: {
        domainPrefix: subdomain,
        title: 'Aflys Tid | ' + theme.businessInfo.name,
        businessName: theme.businessInfo.name,
        favicon: 'logo-dark.svg',
        appointment: appointment,
        cancelToken: cancelToken,
        domainPrefix: subdomain,
        canCancel: appointment && dayjs.utc().add(1, 'hour').add(theme.bookingSettings.latestCancelBefore, 'minutes').isBefore(appointment.startTime),
        isCancelled: appointment && appointment.cancelled,
        isComplete: appointment && appointment.complete
      }
    }
  
  } catch (err)
  {
    if (err.response && err.response.status === 404) return {
      redirect: {
        permanent: false,
        destination: '/404'
      }
    }
  
    return {
      props: {
        error: err.message
      }
    }
  }
}