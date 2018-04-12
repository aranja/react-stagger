import React from 'react'
import TestRenderer from 'react-test-renderer'
import Stagger from '..'
import StaggerTiming from '../StaggerTiming'

describe('Stagger', () => {
  let timing
  beforeEach(() => {
    timing = new StaggerTiming()
  })

  it('should default to true', () => {
    const spy = jest.fn().mockReturnValue(null)
    TestRenderer.create(<Stagger timing={timing}>{spy}</Stagger>)
    expect(spy).lastCalledWith({value: true, delay: 0})
  })

  it('should forward false value', () => {
    const spy = jest.fn().mockReturnValue(null)
    TestRenderer.create(
      <Stagger timing={timing} in={false}>
        {spy}
      </Stagger>,
    )
    expect(spy).lastCalledWith({value: false, delay: 0})
  })

  it('should forward true value', () => {
    const spy = jest.fn().mockReturnValue(null)
    TestRenderer.create(
      <Stagger timing={timing} in={true}>
        {spy}
      </Stagger>,
    )
    expect(spy).lastCalledWith({value: true, delay: 0})
  })

  it('should first render false', () => {
    const spy = jest.fn().mockReturnValue(null)
    TestRenderer.create(
      <Stagger timing={timing} in>
        {spy}
      </Stagger>,
    )
    expect(spy.mock.calls[0]).toEqual([{value: false, delay: 0}])
    expect(spy.mock.calls[1]).toEqual([{value: true, delay: 0}])
  })

  it('when appear is false, initial render should match in value', () => {
    const spy = jest.fn().mockReturnValue(null)
    TestRenderer.create(
      <Stagger timing={timing} in appear={false}>
        {spy}
      </Stagger>,
    )
    expect(spy.mock.calls[0]).toEqual([{value: true, delay: 0}])
  })

  it('should only be true if all ancestors are true', () => {
    const spy = jest.fn().mockReturnValue(null)
    TestRenderer.create(
      <Stagger in={false} timing={timing}>
        <Stagger in={true}>{spy}</Stagger>
      </Stagger>,
    )
    expect(spy).lastCalledWith({value: false, delay: 0})
  })

  it('should stagger multiple elements', () => {
    const spy = jest.fn().mockReturnValue(null)
    TestRenderer.create(
      <div>
        <Stagger timing={timing}>{spy}</Stagger>
        <Stagger timing={timing}>{spy}</Stagger>
        <Stagger timing={timing}>{spy}</Stagger>
        <Stagger timing={timing}>{spy}</Stagger>
      </div>,
    )
    expect(spy.mock.calls.slice(-4)).toEqual([
      [{value: true, delay: 0}],
      [{value: true, delay: 100}],
      [{value: true, delay: 200}],
      [{value: true, delay: 300}],
    ])
  })

  it('should delay on both sides', () => {
    const spy = jest.fn().mockReturnValue(null)
    TestRenderer.create(
      <div>
        <Stagger timing={timing}>{spy}</Stagger>
        <Stagger timing={timing}>{spy}</Stagger>
        <Stagger delay={300} timing={timing}>
          {spy}
        </Stagger>
        <Stagger timing={timing}>{spy}</Stagger>
        <Stagger timing={timing}>{spy}</Stagger>
      </div>,
    )
    expect(spy.mock.calls.slice(-5)).toEqual([
      [{value: true, delay: 0}],
      [{value: true, delay: 100}],
      [{value: true, delay: 400}],
      [{value: true, delay: 700}],
      [{value: true, delay: 800}],
    ])
  })

  it('supports before and after delay', () => {
    const spy = jest.fn().mockReturnValue(null)
    TestRenderer.create(
      <div>
        <Stagger timing={timing}>{spy}</Stagger>
        <Stagger delay={[200, 300]} timing={timing}>
          {spy}
        </Stagger>
        <Stagger timing={timing}>{spy}</Stagger>
      </div>,
    )
    expect(spy.mock.calls.slice(-3)).toEqual([
      [{value: true, delay: 0}],
      [{value: true, delay: 200}],
      [{value: true, delay: 500}],
    ])
  })

  it('should collapse starting delays', () => {
    const spy = jest.fn().mockReturnValue(null)
    TestRenderer.create(
      <div>
        <Stagger timing={timing}>
          <Stagger delay={300}>{spy}</Stagger>
        </Stagger>
      </div>,
    )
    expect(spy).lastCalledWith({value: true, delay: 0})
  })

  it('should collapse non-leaf delays', () => {
    const spy = jest.fn().mockReturnValue(null)
    TestRenderer.create(
      <div>
        <Stagger timing={timing}>{spy}</Stagger>
        <Stagger timing={timing}>
          <Stagger delay={300} timing={timing}>
            {spy}
          </Stagger>
        </Stagger>
        <Stagger timing={timing}>{spy}</Stagger>
      </div>,
    )
    expect(spy.mock.calls.slice(-3)).toEqual([
      [{value: true, delay: 0}],
      [{value: true, delay: 300}],
      [{value: true, delay: 600}],
    ])
  })

  it('should reset with no delay', () => {
    const spy = jest.fn().mockReturnValue(null)
    const renderer = TestRenderer.create(
      <div>
        <Stagger timing={timing}>{spy}</Stagger>
        <Stagger>
          <Stagger timing={timing}>{spy}</Stagger>
        </Stagger>
        <Stagger timing={timing}>{spy}</Stagger>
      </div>,
    )
    renderer.update(
      <div>
        <Stagger in={false} timing={timing}>
          {spy}
        </Stagger>
        <Stagger in={false} timing={timing}>
          <Stagger timing={timing}>{spy}</Stagger>
        </Stagger>
        <Stagger in={false} timing={timing}>
          {spy}
        </Stagger>
      </div>,
    )

    expect(spy.mock.calls.slice(-3)).toEqual([
      [{value: false, delay: 0}],
      [{value: false, delay: 0}],
      [{value: false, delay: 0}],
    ])
  })

  it('should unsubscribe when unmounted', () => {
    const renderer = TestRenderer.create(
      <Stagger timing={timing} in={false}>
        <Stagger timing={timing} />
      </Stagger>,
    )
    renderer.update(<Stagger timing={timing} in={true} />)

    const rootInstance = renderer.root.instance
    expect(rootInstance.subscribers).toHaveLength(0)
  })

  it('can unmount without error', () => {
    const renderer = TestRenderer.create(<Stagger timing={timing} />)
    const rootInstance = renderer.root.instance
    expect(rootInstance.unsubscribe).toBeNull()

    renderer.update(null)
  })
})
