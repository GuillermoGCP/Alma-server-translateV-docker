import express from 'express'
import {
  newPartner,
  renewPartnership,
  unsuscribePartnership,
  checkSubscription,
  checkAllSubscriptions,
  checkAccesCode,
} from '../controllers/index.js'

const router = express.Router()

router.post('/new-partner', newPartner)
router.post('/renew-partnership', renewPartnership)
router.post('/unsubscribe-partnership', unsuscribePartnership)
router.post('/check-subscription', checkSubscription)
router.post('/check-access-code', checkAccesCode)
router.get('/check-all-subscriptions', checkAllSubscriptions)

export default router
