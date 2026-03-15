type KeyState = {
    value: string
    weight: number
    active: boolean
    cooldownUntil: number
    lastUsedStep: number
}

export class ProbabilityManager {
    private keys: KeyState[]
    private stepCounter = 0

    private readonly BASE_WEIGHT = 100
    private readonly MIN_WEIGHT = 10
    private readonly MAX_WEIGHT = 200
    private readonly COOLDOWN_MS = 30_000

    // controls how strong recency memory is
    private readonly RECENCY_FACTOR = 0.35

    constructor(apiKeys: (string | undefined)[]) {
        const validKeys = apiKeys.filter(k => k && k.length > 10)

        this.keys = validKeys.map(k => ({
            value: k as string,
            weight: this.BASE_WEIGHT,
            active: true,
            cooldownUntil: 0,
            lastUsedStep: -1000 // ensures all start equally
        }))

        this.shuffle(this.keys)

        console.log(`✅ Manager initialized with ${this.keys.length} keys`)
    }

    getKey(): string | null {

        this.recoverKeys()

        const activeKeys = this.keys.filter(k => k.active)

        if (activeKeys.length === 0) return null

        // calculate effective weights with recency boost
        const effectiveWeights = activeKeys.map(k => {
            const stepsSince = this.stepCounter - k.lastUsedStep
            const boost = 1 + this.RECENCY_FACTOR * Math.max(0, stepsSince)
            return k.weight * boost
        })

        const totalWeight = effectiveWeights.reduce((s, w) => s + w, 0)

        let pivot = Math.random() * totalWeight

        for (let i = 0; i < activeKeys.length; i++) {

            const key = activeKeys[i]
            const effectiveWeight = effectiveWeights[i]

            if (pivot < effectiveWeight) {

                this.adjustWeights(key)

                key.lastUsedStep = this.stepCounter
                this.stepCounter++

                const id = key.value.slice(-4)

                console.log(
                    `🎯 Picked [...${id}] base=${key.weight.toFixed(1)}`
                )

                return key.value
            }

            pivot -= effectiveWeight
        }

        const fallback = activeKeys[Math.floor(Math.random() * activeKeys.length)]

        fallback.lastUsedStep = this.stepCounter
        this.stepCounter++

        return fallback.value
    }

    disableKey(keyVal: string) {

        const key = this.keys.find(k => k.value === keyVal)

        if (!key) return

        key.active = false
        key.cooldownUntil = Date.now() + this.COOLDOWN_MS

        console.error(`🚨 Key [...${keyVal.slice(-4)}] disabled for cooldown`)
    }

    reportSuccess(keyVal: string) {

        const key = this.keys.find(k => k.value === keyVal)
        if (!key) return

        key.weight = Math.min(this.MAX_WEIGHT, key.weight + 10)
    }

    reportFailure(keyVal: string) {

        const key = this.keys.find(k => k.value === keyVal)
        if (!key) return

        key.weight = Math.max(this.MIN_WEIGHT, key.weight * 0.5)
    }

    private adjustWeights(selected: KeyState) {

        const penalty = selected.weight * 0.4

        selected.weight = Math.max(this.MIN_WEIGHT, selected.weight - penalty)

        const active = this.keys.filter(k => k.active && k !== selected)

        if (active.length === 0) return

        const gain = penalty / active.length

        for (const k of active) {
            k.weight = Math.min(this.MAX_WEIGHT, k.weight + gain)
        }
    }

    private recoverKeys() {

        const now = Date.now()

        for (const k of this.keys) {
            if (!k.active && now >= k.cooldownUntil) {

                k.active = true
                k.weight = this.BASE_WEIGHT
                k.lastUsedStep = this.stepCounter - 5

                console.log(`♻️ Key [...${k.value.slice(-4)}] recovered`)
            }
        }
    }

    private shuffle(arr: any[]) {

        for (let i = arr.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1))

            ;[arr[i], arr[j]] = [arr[j], arr[i]]
        }
    }
}