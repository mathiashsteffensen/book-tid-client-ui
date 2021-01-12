import Head from 'next/head'
import {useState, useEffect} from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import { Container, Row, Col, Alert, Card, Button, Form } from 'react-bootstrap'
import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import parseISO from 'date-fns/parseISO'
import da from 'date-fns/locale/da';
registerLocale('da', da);
setDefaultLocale('da');

import "react-datepicker/dist/react-datepicker.css";

import Slider from '../components/Slider'
import SuccessText from '../components/SuccessText'

import {
  fetchClosedDatesWithinAllowedPeriod, 
  fetchAvailableTimes, 
  bookAppointment,
  getCatsAndServices,
  getTheme
} from '../requests'

import ServiceSelect from '../components/ServiceSelect'

export default function Home(props) 
{
  const {
    domainPrefix, 
    title,
    businessName, 
    favicon, 
    catsAndServices, 
    latestBookingBefore, 
    maxDaysBookAhead, 
    customerComment,
    hideServiceDuration,
    hideServicePrice, 
    error
  } = props

  if (!error)
  {
    const [shouldUpdate, setShouldUpdate] = useState(false)
    const update = () => setShouldUpdate(!shouldUpdate)

    const [sliders, setSliders] = useState({
      service: {
        status: 'open',
        title: '1) Vælg Service'
      },
      time: {
        status: 'closed',
        title: '2) Vælg Dato & Tid'
      },
      confirm: {
        status: 'closed',
        title: '3) Bekræft Booking'
      }
    })

    const [closedDates, setClosedDates] = useState([])

    const [serviceSelected, setServiceSelected] = useState('')
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTime, setSelectedTime] = useState(null)
    const [selectedCalendar, setSelectedCalendar] = useState(null)

    const [customer, setCustomer] = useState({
      name: '',
      email: '',
      phoneNumber: '',
      comment: ''
    })

    const [success, setSuccess] = useState(false)
    const [successText, setSuccessText] = useState('')

    const handleSliderClick = (clicked) =>
    {
      success && setSuccess(false)

      if (sliders[clicked].status === 'open') setSliders({...sliders, ...{[clicked]: {status: 'closed', title: sliders[clicked].title}}})
      else {
        let newSliders = sliders

        Object.keys(sliders).forEach(async (slider) =>
        {
          if (slider !== clicked && sliders[slider].status === 'open') newSliders[slider].status = 'closed'
          else if (slider === clicked) newSliders[clicked].status = 'open'
        })

        setSliders(newSliders)
        update()
      }
    }

    const handleServiceChange = (e) =>
    {
      success && setSuccess(false)
      if (e !== '' && e.target.value !== 'default')
      {
        setServiceSelected(e.target.value)
        handleSliderClick('time')
        setSliders({...sliders, ...{service: {title: '1) Valgt Service >> ' + JSON.parse(e.target.value).name}}})
        if (selectedDate !== '') handleTimeChange('')
      } else if (e === '') setServiceSelected('')
    }

    const handleDateChange = (date) =>
    {
      success && setSuccess(false)
      setSelectedDate(date)
    }

    const handleTimeChange = (time, calendarID) =>
    {
      success && setSuccess(false)
      if (time !== '')
      {
        setSelectedTime(time.toJSON())
        setSelectedCalendar(calendarID)
        handleSliderClick('confirm')
        setSliders({...sliders, ...{time: {title: '2) Valgt Dato & Tid >> ' + time.format('DD/MM/YYYY HH:mm')}}})
      } else
      {
        console.log('reseting time');
        setSelectedTime('')
        setSliders({...sliders, ...{time: {title: '2) Vælg Dato & Tid', status: 'closed'}}})
        update()
      }  
    }

    const handleCustomerChange = (key, value) =>
    {
      success && setSuccess(false)
      setCustomer({...customer, ...{[key]: value}})
    }

    const [submitError, setSubmitError] = useState('')

    const handleSubmit = () =>
    {
      success && setSuccess(false)
      const time = dayjs(selectedTime).add(1, 'hour')

      bookAppointment(domainPrefix, JSON.parse(serviceSelected)._id, selectedCalendar, time.toJSON(), customer)
      .then((res) =>
      {

        setSuccessText(<SuccessText 
          name={customer.name.split(' ')[0]}
          date={dayjs(res.date)}
          startTime={dayjs(res.startTime).subtract(1, 'hour')}
          endTime={!hideServiceDuration ? dayjs(res.endTime).subtract(1, 'hour') : false}
          serviceName={JSON.parse(serviceSelected).name}
          companyName={businessName}
        />)
        setSuccess(true)

        setSliders({
          service: {
            status: 'closed',
            title: '1) Vælg Service'
          },
          time: {
            status: 'closed',
            title: '2) Vælg Dato & Tid'
          },
          confirm: {
            status: 'closed',
            title: '3) Bekræft Booking'
          }
        })
    
        setClosedDates([])
    
        setServiceSelected('')
        setSelectedDate('')
        setSelectedTime(null)
        setSelectedCalendar(null)
    
        setCustomer({
          ...customer,
          ...{comment: ''}
        })
        update()
      })
      .catch((err) =>
      {
        setSubmitError(err)
      })
    }

    useEffect(() =>
    {
      fetchClosedDatesWithinAllowedPeriod(maxDaysBookAhead, domainPrefix)
      .then((closedDates) =>
      {
        setClosedDates(closedDates.map(date => parseISO(dayjs(date).add(12, 'hours').toISOString())))
      })
      .catch((err) => console.log(err))
    }, [])

    const [calendars, setCalendars] = useState([])

    useEffect(() =>
    {
      if (serviceSelected !== '' && selectedDate !== '')
      {
        fetchAvailableTimes(domainPrefix, JSON.parse(serviceSelected)._id, selectedDate)
        .then((res) =>
        {
          console.log(res)
          setCalendars(res)
        })
        .catch((err) => 
        {
          console.log(err.message)
          setCalendars([{loadError: true}]
        )})
      }
    }, [selectedDate, serviceSelected])

    return (
      <Container fluid="xl">
        <Head>
          <title>{title}</title>
          <link rel="icon" href={favicon} />
        </Head>

        <Row>
          <Col md={8}>
            <Slider
              title={sliders.service.title}
              handleClick={() => handleSliderClick('service')}
              isOpen={sliders.service.status === 'open'}
            >
              <ServiceSelect 
                handleChange={handleServiceChange} 
                selected={serviceSelected} 
                catsAndServices={catsAndServices}
                hideServiceDuration={hideServiceDuration}
                hideServicePrice={hideServicePrice} 
              />
            </Slider>

            <Slider
              title={sliders.time.title}
              handleClick={() => handleSliderClick('time')}
              isOpen={sliders.time.status === 'open'}
            >
                {closedDates.length > 0 ? <div><label style={{marginRight: '2rem'}} htmlFor="pick-date">Vælg Dato:</label>
                <DatePicker
                  id="pick-date"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  minDate={parseISO(dayjs().add(latestBookingBefore + 60, 'minutes').toISOString())}
                  excludeDates={closedDates}
                /></div> : <div className="spinner-border"></div>}

                {selectedDate !== '' && <div>
                    {serviceSelected === ''  
                    ? <Alert className="mt-2" variant="danger">Vælg venligst en service for at fortsætte</Alert> 
                    : <div>
                        {calendars.length === 0
                        ? <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} className="w-full mt-2"><div className="spinner-border"></div></div>
                        : <div>
                          {calendars[0].loadError 
                          ? 'Der skete en fejl, genindlæs venligst siden for at prøve igen :('
                          : calendars.map((calendar) =>
                          {
                            return ( 
                              <Card className="mt-2"key={calendar.calendar.calendarID}>
                                <Card.Body>
                                  <div style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <img className="avatar" src={calendar.calendar.pictureURL} />
                                    <h4 style={{marginBottom: 0, marginLeft: '0.5rem',}} className="h6">{calendar.calendar.name}</h4> 
                                  </div>
                                  {calendar.availableTimes.map(time => <Button onClick={() => handleTimeChange(dayjs(time.startTime).subtract(1, 'hour'), calendar.calendar.calendarID)} key={dayjs(time.startTime).subtract(1, 'hour').format('H-mm')} variant="outline-info" style={{width: '5rem', fonSize: '0.7rem', margin: '0.2rem', marginTop: '0.7rem',}}>{dayjs(time.startTime).subtract(1, 'hour').format('H:mm')}</Button>)}
                                </Card.Body>
                              </Card>
                            )
                          })}
                        </div>}
                      </div>}
                </div>}
            </Slider>
          
            <Slider
              title={sliders.confirm.title}
              handleClick={() => handleSliderClick('confirm')}
              isOpen={sliders.confirm.status === 'open'}
            >
                <Form>
                  <Form.Group>
                    <Form.Label>
                      Fulde Navn:
                    </Form.Label>
                    <Form.Control 
                      onChange={(e) => handleCustomerChange('name', e.target.value)} 
                      autoComplete="name"
                      value={customer.name} 
                      required 
                      type="name" 
                      placeholder="Indtast dit fulde navn" 
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>
                      E-Mail
                    </Form.Label>
                    <Form.Control autoComplete="email" onChange={(e) => handleCustomerChange('email', e.target.value)} value={customer.email} required type="email" placeholder="Indtast din e-mail" />
                    <Form.Text className="text-muted">
                      Vi deler aldrig din e-mail med andre organisationer
                    </Form.Text>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>
                      Telefon
                    </Form.Label>
                    <Form.Control autoComplete="tel" onChange={(e) => handleCustomerChange('phoneNumber', e.target.value)} value={customer.phoneNumber} type="tel" placeholder="Indtast dit telefonnummer" />
                  </Form.Group>

                  {customerComment && <Form.Group>
                    <Form.Label>Evt. kommentar</Form.Label>
                    <Form.Control 
                      onChange={(e) => handleCustomerChange('comment', e.target.value)} 
                      value={customer.comment} 
                      as="textarea" 
                      rows={3} 
                    />
                  </Form.Group>}

                  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} className="w-full">
                    <Button onClick={handleSubmit}>
                      Book Tid
                    </Button> 
                  </div>
                  
                  {submitError !== '' && <Alert variant="danger">{submitError}</Alert>}
                </Form>
            </Slider>            

            <Alert className={success ? "m-4 border border-success" : "m-4 border border-success d-none"} variant="success">
                    {successText}
            </Alert>

            <Alert style={{fontSize: '0.8rem'}} className="mt-2 border border-warning" variant="warning">
            <strong>EMAIL & SMS:</strong> Når du booker accepterer du at modtage bekræftelser på email.
              <br />
              <br />
            <strong>AFBUD:</strong> Du finder et link til afbud i den bekræftelses e-mail du modtager når du har booket tid. <p className="text-muted">(Hvis du ikke kan finde en E-Mail, check din SPAM mappe, ellers kontakt os på <a href="mailto:service@booktid.net">service@booktid.net</a>)</p>
            </Alert>
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
  } else return <div>Error: {error}</div>
  
}

export async function getServerSideProps({req})
{
  const subdomain = req.headers.host.split('.')[0]
  console.log(subdomain);
  try {
    const theme = await getTheme(subdomain)

    const catsAndServices = await getCatsAndServices(subdomain)
    console.log(theme, catsAndServices)

    return {
      props: {
        domainPrefix: subdomain,
        title: 'Book Tid | ' + theme.businessInfo.name,
        businessName: theme.businessInfo.name,
        favicon: 'logo-dark.svg',
        catsAndServices: JSON.parse(JSON.stringify(catsAndServices)),
        latestBookingBefore: theme.bookingSettings.latestBookingBefore,
        maxDaysBookAhead: theme.bookingSettings.maxDaysBookAhead,
        customerComment: !theme.bookingSettings.hideCustomerCommentSection,
        hideServiceDuration: theme.bookingSettings.hideServiceDuration,
        hideServicePrice: theme.bookingSettings.hideServicePrice
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