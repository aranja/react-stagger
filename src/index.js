import {Component} from 'react'
import PropTypes from 'prop-types'
import StaggerTiming from './StaggerTiming'

const globalTiming = new StaggerTiming()

class Stagger extends Component {
  static childContextTypes = {
    stagger: PropTypes.object.isRequired,
  }

  static contextTypes = {
    stagger: PropTypes.object,
  }

  static defaultProps = {
    delay: 100,
    in: true,
    appear: true,
  }

  static propTypes = {
    timing: PropTypes.instanceOf(StaggerTiming),
    delay: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    in: PropTypes.bool,
    appear: PropTypes.bool,
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  }

  staggerContext = {
    subscribe: this.subscribe.bind(this),
    value: false,
    timing: this.props.timing || this.context.timing || globalTiming,
  }
  selfValue = this.props.in
  subscribers = []
  unsubscribe = null
  state = {
    value: false,
    delay: 0,
  }

  componentWillMount() {
    if (this.context.stagger) {
      this.unsubscribe = this.context.stagger.subscribe(() =>
        this.checkUpdate(),
      )
    }
    if (!this.props.appear) {
      this.checkUpdate(true)
    }
  }

  componentDidMount() {
    if (this.props.appear) {
      this.checkUpdate()
    }
  }

  componentWillReceiveProps(newProps) {
    this.selfValue = newProps.in
    this.checkUpdate()
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }

  checkUpdate(forceInstant) {
    // Only stagger if self and all parents are active.
    const parentValue = this.context.stagger ? this.context.stagger.value : true
    const value = this.selfValue && parentValue

    // Only continue if the value has changed.
    if (value === this.staggerContext.value) {
      return
    }

    this.staggerContext.value = value

    const delay = this.calculateDelay(value, forceInstant)
    this.setState({
      value,
      delay,
    })
  }

  calculateDelay(value, forceInstant) {
    // Get delay for self. Note, the actual delay is max of all stagger
    // delays since last leaf stagger.
    // stagger(300)    - 0
    //   stagger(100)  - 0
    //   stagger(100)  - 100
    //   stagger(100)  - 200
    // stagger(200)    - 400
    //   stagger(100)  - 400
    // stagger(500)    - 900

    if (forceInstant) {
      return 0
    }

    const timing = this.staggerContext.timing
    const isLeaf = !this.subscribers.length
    const [beforeDelay, afterDelay] = this.getOwnDelay()

    // Add delay for self and get total delay since last leaf.
    const totalDelay = value ? timing.getDelay(beforeDelay, isLeaf) : 0

    if (!isLeaf) {
      // Notify children of change.
      this.subscribers.forEach(subscriber => {
        subscriber()
      })
    }

    // Add delay after children.
    if (value) {
      timing.getDelay(afterDelay, false)
    }

    return totalDelay
  }

  getOwnDelay() {
    const {delay} = this.props
    return Array.isArray(delay) ? delay : [delay, delay]
  }

  getChildContext() {
    return {
      stagger: this.staggerContext,
    }
  }

  subscribe(handler) {
    this.subscribers.push(handler)
    return () => {
      this.subscribers = this.subscribers.filter(h => h !== handler)
    }
  }

  render() {
    const {children} = this.props
    if (typeof children === 'function') {
      return children(this.state)
    }
    return children || null
  }
}

export default Stagger
