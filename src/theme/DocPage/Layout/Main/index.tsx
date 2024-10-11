import React, { ReactNode, useEffect, useState } from 'react'

import clsx from 'clsx'
import { Location } from 'history'

import { Box, Grid } from '@mui/material'
import { useLocation } from '@docusaurus/router'
import PaginatorNavLink from '@theme/PaginatorNavLink'
import type { Props } from '@theme/DocPage/Layout/Main'
import { useDocsSidebar } from '@docusaurus/theme-common/internal'

import styles from './styles.module.css'
import { Header } from '../../../../components/tutorials/Tutorial'
import { Meta, Step } from '../../../../components/tutorials/models'
import Steps, { stepToHistory } from '../../../../components/tutorials/Steps'

import { useWindowSize } from '@docusaurus/theme-common'

function getMeta(location: Location): Meta {
  const locationSplit = location.pathname.split('/')
  const tutorialName = locationSplit[2]
  const context = require.context('@site/tutorials/', true)

  try {
    const meta = context(`./${tutorialName}/meta.json`)
    meta['id'] = tutorialName
    return Meta.parse(meta)
  } catch (e) {
    throw new Error(
      `Could not find meta.json for tutorial ${tutorialName}, location: ${location.pathname}`
    )
  }
}

function getSteps(location: Location): Step[] {
  const locationSplit = location.pathname.split('/')
  const tutorialName = locationSplit[2]
  const context = require.context('@site/tutorials/', true)

  // Filter to ones that are in the `tutorialname` dir
  const steps = context
    .keys()
    .filter((key) => key.includes(tutorialName) && key.endsWith('md'))
    .map((key) => [key, context(key)])
    .map(([path, mdFile]) => Step.parse({ ...mdFile.frontMatter, path }))

  steps.sort((a, b) => a.position - b.position)

  return steps
}

function getPrev(location: Location): Step | null {
  const steps = getSteps(location)
  const asPath = steps.map((step) => stepToHistory(step))
  const current = asPath.findIndex((path) => {
    return location.pathname == path || location.pathname == path + '/'
  })
  if (current === -1) {
    return null
  }

  if (current > 0) {
    const ret = steps[current - 1]
    ret.path = stepToHistory(ret)
    return ret
  }

  return null
}

function getNext(location: Location): Step | null {
  const steps = getSteps(location)
  const asPath = steps.map((step) => stepToHistory(step))
  const current = asPath.findIndex((path) => {
    return location.pathname == path || location.pathname == path + '/'
  })

  if (current === -1) {
    return null
  }

  if (current + 1 < steps.length) {
    const ret = steps[current + 1]
    ret.path = stepToHistory(ret)
    return ret
  }

  return null
}

function Paginators({
  next,
  prev,
  setActiveStep,
  isMobile = false,
}: {
  next: Step | null
  prev: Step | null
  setActiveStep: (step: Step) => void
  isMobile: boolean
}): JSX.Element {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
      }}
    >
      <Grid
        justifyContent="space-between"
        direction={isMobile ? 'column' : 'row'}
        container
        columnSpacing={2}
      >
        <Grid item xs={6}>
          {prev ? (
            <PaginatorNavLink
              onClick={() => setActiveStep(prev)}
              isNext={false}
              permalink={prev.path}
              title={prev.title}
              subLabel="Previous"
            />
          ) : (
            // Zero width element so space-between aligns right correctly if there is no previous
            <></>
          )}
        </Grid>

        {next && (
          <Grid item xs={6}>
            <PaginatorNavLink
              onClick={() => setActiveStep(next)}
              isNext={true}
              permalink={next.path}
              title={next.title}
              subLabel="Next"
            />
          </Grid>
        )}
      </Grid>
      {!isMobile && <Box className="col col--3"></Box>}
    </Box>
  )
}

export default function DocPageLayoutMain({
  hiddenSidebarContainer,
  children,
}: Props): JSX.Element {
  const sidebar = useDocsSidebar()
  const location = useLocation()
  const [isTutorial, setIsTutorial] = React.useState(() =>
    location.pathname.startsWith('/tutorials')
  )
  const [steps, setSteps] = React.useState(() =>
    isTutorial ? getSteps(location) : []
  )
  const [activeStep, setActiveStep] = React.useState<Step>(() => {
    const locationSplit = location.pathname.split('/')
    const stepName = locationSplit[locationSplit.length - 1].replace('.md', '')
    const step = steps.find((step) => step.path.includes(stepName))

    if (!step) {
      return steps[0]
    }

    return step
  })
  const [meta, setMeta] = useState<Meta | null>(null)
  const [next, setNext] = useState<Step | null>(null)
  const [prev, setPrev] = useState<Step | null>(null)
  const windowSize = useWindowSize()
  const [isMobile, setIsMobile] = useState(windowSize === 'mobile')

  useEffect(() => {
    setIsMobile(windowSize === 'mobile')
  }, [windowSize])

  useEffect(() => {
    setIsTutorial(location.pathname.startsWith('/tutorials'))
  }, [location])

  useEffect(() => {
    if (!isTutorial) return
    setMeta(getMeta(location))
    setSteps(getSteps(location))
    setNext(getNext(location))
    setPrev(getPrev(location))
  }, [location])

  if (isTutorial) {
    return (
      <main
        className={clsx(
          styles.docMainContainer,
          (hiddenSidebarContainer || !sidebar) &&
            styles.docMainContainerEnhanced
        )}
      >
        {isMobile ? (
          <Mobile
            children={children}
            meta={meta}
            steps={steps}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            next={next}
            prev={prev}
          />
        ) : (
          <Desktop
            children={children}
            meta={meta}
            steps={steps}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            next={next}
            prev={prev}
          />
        )}
      </main>
    )
  }
  return (
    <main
      className={clsx(
        styles.docMainContainer,
        (hiddenSidebarContainer || !sidebar) && styles.docMainContainerEnhanced
      )}
    >
      <div
        className={clsx(
          'container padding-top--md padding-bottom--lg',
          styles.docItemWrapper,
          hiddenSidebarContainer && styles.docItemWrapperEnhanced
        )}
      >
        {children}
      </div>
    </main>
  )
}

function Mobile({
  children,
  meta,
  steps,
  activeStep,
  setActiveStep,
  next,
  prev,
}: {
  children: ReactNode
  meta: Meta | null
  steps: Step[]
  activeStep: Step
  setActiveStep: (step: Step) => void
  next: Step | null
  prev: Step | null
}): JSX.Element {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .pagination-nav {
              margin-top: 2rem;
          }
          
          .feedbackPrompt_src-theme-DocItem-Footer-styles-module {
            margin-top: 3rem;
          }

      `,
        }}
      />

      <Grid
        sx={{ m: 2, mt: 0 }}
        rowSpacing={2}
        container
        direction="column"
        wrap="nowrap"
      >
        <Grid item>
          <Header title={meta?.title || ''} label={meta?.label || ''} />
        </Grid>
        <Grid item xs={4}>
          <Steps
            steps={steps}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />
        </Grid>
        <Grid item>{children}</Grid>
        <Paginators
          next={next}
          prev={prev}
          setActiveStep={setActiveStep}
          isMobile={true}
        />
      </Grid>
    </>
  )
}

function Desktop({
  children,
  meta,
  steps,
  activeStep,
  setActiveStep,
  next,
  prev,
}: {
  children: ReactNode
  meta: Meta | null
  steps: Step[]
  activeStep: Step
  setActiveStep: (step: Step) => void
  next: Step | null
  prev: Step | null
}): JSX.Element {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .pagination-nav {
              margin-top: 2rem;
          }
          
          .feedbackPrompt_src-theme-DocItem-Footer-styles-module {
            margin-top: 3rem
          }

          .theme-doc-footer-edit-meta-row {
            display: none;
          }
      `,
        }}
      />

      <Grid container sx={{ m: 3 }} columnSpacing={5}>
        <Grid container item direction="column">
          <Grid item>
            <Header title={meta?.title || ''} label={meta?.label || ''} />
          </Grid>
          <Grid container item wrap="nowrap" columnGap={5}>
            <Grid item xs={4}>
              <Steps
                steps={steps}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
              />
            </Grid>
            <Grid item container>
              <Grid sx={{ width: '100%' }} item>
                {children}
              </Grid>
              <Paginators
                next={next}
                prev={prev}
                setActiveStep={setActiveStep}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}
