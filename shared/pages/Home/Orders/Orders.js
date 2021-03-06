import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { withRouter } from 'react-router-dom'

import { isMobile } from 'react-device-detect'

import constants from 'helpers/constants'

import cssModules from 'react-css-modules'
import styles from './Orders.scss'

import { Button } from 'components/controls'
import Table from 'components/tables/Table/Table'
import Title from 'components/PageHeadline/Title/Title'
import tableStyles from 'components/tables/Table/Table.scss'
import PageSeo from 'components/Seo/PageSeo'

import Pair from './Pair'
import Row from './Row/Row'
import RowMobile from './RowMobile/RowMobile'
import MyOrders from './MyOrders/MyOrders'


const filterMyOrders = (orders, peer) => orders
  .filter(order => order.owner.peer === peer)

const filterOrders = (orders, filter) => orders
  .filter(order => order.isProcessing !== true)
  .filter(order => Pair.check(order, filter))
  .sort((a, b) => Pair.compareOrders(b, a))

@connect(({
  core: { orders, filter },
  ipfs: { isOnline, peer },
  currencies: { items: currencies },
}) => ({
  orders: filterOrders(orders, filter),
  myOrders: filterMyOrders(orders, peer),
  isOnline,
  currencies,
}))
@withRouter
@cssModules(styles)
export default class Orders extends Component {

  state = {
    buyOrders: [],
    sellOrders: [],
    isVisible: false,
  }

  static getDerivedStateFromProps({ orders }) {
    if (!Array.isArray(orders)) { return }

    const sellOrders = orders
      .filter(order => Pair.fromOrder(order).isAsk())

    const buyOrders = orders
      .filter(order => Pair.fromOrder(order).isBid())

    return {
      buyOrders,
      sellOrders,
    }
  }

  createOffer = async () => {
    const { buyCurrency, sellCurrency } = this.props

    await actions[sellCurrency].getBalance(sellCurrency)

    actions.modals.open(constants.modals.Offer, {
      buyCurrency,
      sellCurrency,
    })
    actions.analytics.dataEvent('orderbook-click-createoffer-button')
  }

  removeOrder = (orderId) => {
    if (confirm('Are your sure ?')) {
      actions.core.removeOrder(orderId)
      actions.core.updateCore()
    }
  }

  acceptRequest = (orderId, peer) => {
    actions.core.acceptRequest(orderId, peer)
    actions.core.updateCore()
  }

  declineRequest = (orderId, peer) => {
    actions.core.declineRequest(orderId, peer)
    actions.core.updateCore()
  }

  render() {
    const { sellOrders, buyOrders, isVisible } = this.state
    let { sellCurrency, buyCurrency } = this.props
    buyCurrency = buyCurrency.toUpperCase()
    sellCurrency = sellCurrency.toUpperCase()

    const titles = [ 'OWNER', `AMOUNT`, `PRICE FOR 1 ${buyCurrency}`, `TOTAL`, 'START EXCHANGE' ]
    const { isOnline, myOrders, orderId, invalidPair, location, currencies } = this.props

    const buyCurrencyFullName = (currencies.find(c => c.name === buyCurrency) || {}).fullTitle
    const sellCurrencyFullName = (currencies.find(c => c.name === sellCurrency) || {}).fullTitle

    return (
      <Fragment>
        <PageSeo location={location} defaultTitle={`Atomic Swap ${buyCurrencyFullName} (${buyCurrency}) to ${sellCurrencyFullName} (${sellCurrency}) Instant Exchange`} defaultDescription={`Best exchange rate for ${buyCurrencyFullName} (${buyCurrency}) to ${sellCurrencyFullName} (${sellCurrency}). Swap.Online wallet provides instant exchange using Atomic Swap Protocol.`} />
        <Title>{buyCurrency}/{sellCurrency} no limit exchange with 0 fee</Title>
        { invalidPair && <p> No such ticker. Redirecting to SWAP-BTC exchange... </p> }
        <div styleName="buttonRow">
          <Button green styleName="button" disabled={myOrders.length === 0} onClick={() => this.setState(state => ({ isVisible: !state.isVisible }))}>
            {isVisible ? 'Hide' : 'Show'} my Orders
          </Button>
          <Button gray styleName="button" onClick={this.createOffer}>Create offer</Button>
        </div>
        {
          isVisible && <MyOrders
            myOrders={myOrders}
            declineRequest={this.declineRequest}
            removeOrder={this.removeOrder}
            acceptRequest={this.acceptRequest}
          />
        }
        <h3 styleName="ordersHeading">BUY {buyCurrency} HERE</h3>
        <p>orders of those who <i>sell</i> {buyCurrency} to you</p>
        <Table
          id="table_exchange"
          className={tableStyles.exchange}
          titles={titles}
          rows={sellOrders}
          rowRender={(row, index) => (
            isMobile &&  <RowMobile
              key={index}
              orderId={orderId}
              row={row} 
            /> || <Row
              key={index}
              orderId={orderId}
              row={row} 
            />
          )}
          isLoading={!isOnline}
        />
        <h3 styleName="ordersHeading">SELL {buyCurrency} HERE</h3>
        <p>orders that <i>buy</i> {buyCurrency} from you</p>
        <Table
          id="table_exchange"
          className={tableStyles.exchange}
          titles={titles}
          rows={buyOrders}
          rowRender={(row, index) => (
            isMobile &&  <RowMobile
              key={index}
              orderId={orderId}
              row={row} 
            /> || <Row
              key={index}
              orderId={orderId}
              row={row} 
            />
          )}
          isLoading={!isOnline}
        />
      </Fragment>
    )
  }
}
