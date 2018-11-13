import React        from 'react'
import { Route }    from 'react-router'
import { Switch }   from 'react-router-dom'
import { links }    from 'helpers'
import { localisePrefix } from 'helpers/locale'

import SwapComponent    from 'pages/Swap/Swap'
import Home             from 'pages/Home/Home'
import Wallet           from 'pages/Wallet/Wallet'
import Listing          from 'pages/Listing/Listing'
import History          from 'pages/History/History'
import NotFound         from 'pages/NotFound/NotFound'
import Affiliate        from 'pages/Affiliate/Affiliate'
import Currency         from 'pages/Currency/Currency'
import PartialClosure   from 'pages/PartialClosure/PartialClosure'
import CurrencyWallet   from 'pages/CurrencyWallet/CurrencyWallet'


const routes = (
  <Switch>
    <Route path={`${localisePrefix}${links.swap}/:buy-:sell/:orderId`} component={SwapComponent} />    

    <Route path={`${localisePrefix}${links.exchange}`} component={Home} />
    <Route path={`${localisePrefix}${links.partial}`} component={PartialClosure} />
    <Route path={`${localisePrefix}${links.affiliate}`} component={Affiliate} />
    <Route path={`${localisePrefix}${links.listing}`} component={Listing} />    
    <Route path={`${localisePrefix}${links.history}`} component={History} />

    <Route exact path={`${localisePrefix}${links.home}`} component={Wallet} />

    <Route path={`${localisePrefix}/:fullName-wallet`} component={CurrencyWallet} />
    <Route path={`${localisePrefix}${links.home}:currency`} component={Currency} />

    <Route component={NotFound} />
  </Switch>
)

export default routes
