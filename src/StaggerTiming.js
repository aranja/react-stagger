const STAGGER_GROUP_WINDOW = 100

class StaggerTiming {
  lastStagger = 0
  currentDelay = 0
  lastDelay = 0

  getDelay(newDelay, commitDelay) {
    const now = Date.now()
    newDelay = +newDelay
    if (now - this.lastStagger > STAGGER_GROUP_WINDOW) {
      this.lastStagger = now
      this.currentDelay = 0
      this.lastDelay = 0
    }

    if (this.currentDelay > 0 || this.lastDelay > 0) {
      this.lastDelay = Math.max(this.lastDelay, newDelay)
    }

    const delay = this.currentDelay + this.lastDelay
    if (commitDelay) {
      this.currentDelay += this.lastDelay
      this.lastDelay = newDelay
    }
    return delay
  }
}

export default StaggerTiming
