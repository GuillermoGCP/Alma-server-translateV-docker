import cron from 'node-cron'
import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const isProd = process.env.IS_PRODUCTION === 'production'
const TZ = 'Europe/Madrid'

// - Diario 03:00 -> '0 3 * * *'
// - Cada hora min 41 -> '41 * * * *'
// - 1 enero 00:00 -> '0 0 1 1 *'

const CRON_EXPR = process.env.CRON_CHECK_SUBS || '0 0 1 1 *'

const TARGET_URL = isProd
  ? 'https://api.almalactancia.org/check-all-subscriptions'
  : 'http://localhost:3001/check-all-subscriptions'

export const setupCronJobs = () => {
  if (global.__CRONS_STARTED__) return

  cron.schedule(
    CRON_EXPR,
    async () => {
      try {
        console.log(`[CRON] check-all-subscriptions → ${TARGET_URL}`)
        const { data } = await axios.get(TARGET_URL, {
          headers: { 'x-cron-secret': process.env.CRON_SECRET || '' },
          timeout: 20000,
        })
        console.log('[CRON] OK:', data?.message ?? data)
      } catch (err) {
        const code = err.response?.status || 'NO_HTTP'
        console.error('[CRON] Error:', code, err.message)
      }
    },
    { timezone: TZ }
  )

  global.__CRONS_STARTED__ = true
  console.log(`[CRON] Programado ${CRON_EXPR} (${TZ}) → ${TARGET_URL}`)
}

export default setupCronJobs

//0 0 1 1 *: Este patrón indica:
// 0: Minuto 0.
// 0: Hora 0.
// 1: Día 1.
// 1: Mes de enero (1).
// *: Cualquier día de la semana.

// 0: Domingo
// 1: Lunes
// 2: Martes
// 3: Miércoles
// 4: Jueves
// 5: Viernes
// 6: Sábado
