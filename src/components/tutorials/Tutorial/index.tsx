import { Box, Breadcrumbs, Grid, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'

import { Link } from 'react-router-dom'

import { mdx, MDXProvider } from '@mdx-js/react'
import MDXComponents from '@theme/MDXComponents'
import Layout from '@theme/Layout'

import { Topic } from '../TutorialList/styledComponents'
import PaginatorNavButton from './Paginator'
import { MDXContent, Tutorial } from '../models'
import Steps from './Steps'
import { Feedback } from '../../../theme/DocItem/Footer'

async function getTutorialMdx(path: string): Promise<MDXContent> {
  // It isn't possible to `require` a dynamic path, as rollup won't have bundled it.
  // e.g. require(`../../tutorial/${path}`)
  //
  // `require.context` is a webpack feature that allows us to bundle all files in a directory
  // https://webpack.js.org/guides/dependency-management/#requirecontext
  // So now we can import any file in the `/tutorial` directory
  const mdxContent = require.context('/tutorial', true)
  const mdxModule = await mdxContent(path)
  const parsed = MDXContent.parse({
    default: mdxModule.default,
    frontMatter: mdxModule.frontMatter,
  })
  return parsed
}

function ShowTutorial({ content }: { content?: MDXContent }) {
  const [TutorialContent, setTutorialContent] =
    useState<React.ComponentType | null>(null)

  useEffect(() => {
    if (content) {
      setTutorialContent(() => content.default as React.ComponentType)
    }
  }, [content])

  return <div>{TutorialContent ? <TutorialContent /> : <p>Loading...</p>} </div>
}

function Header({ title, label }: { title: string; label: string }) {
  return (
    <Grid container rowSpacing={0}>
      <Grid item>
        <Breadcrumbs>
          <Link to="/tutorials">Tutorials & Guides</Link>
          <Typography>{title}</Typography>
        </Breadcrumbs>
      </Grid>
      <Grid item container alignItems="center" columnSpacing={2}>
        <Grid item>
          <Typography variant="h4">{title}</Typography>
        </Grid>
        <Grid item>
          <Topic label={label} />
        </Grid>
      </Grid>
    </Grid>
  )
}

function TutorialItem({ content }: { content: Tutorial }) {
  const [steps, setSteps] = React.useState<MDXContent[]>([])
  const [activeStep, setActiveStep] = React.useState(() => {
    const storageKey = `tutorial:${content.meta.title}`
    const storedStep = localStorage.getItem(storageKey)
    return storedStep ? parseInt(storedStep) : 0
  })

  // Update storage with the latest tutorial step viewed
  useEffect(() => {
    const storageKey = `tutorial:${content.meta.title}`
    localStorage.setItem(storageKey, activeStep.toString())
  }, [activeStep])

  useEffect(() => {
    const parseTutorials = async () => {
      const steps: { file: string; content: MDXContent }[] = await Promise.all(
        content.files.map(async (file: string) => {
          const mdxFile: MDXContent = await getTutorialMdx(file)
          return { file, content: mdxFile }
        })
      )

      const sortedSteps = steps.sort((a, b) => {
        return a.content.frontMatter.position - b.content.frontMatter.position
      })

      setSteps(sortedSteps.map((step) => step.content))
    }

    parseTutorials()
  }, [])

  return (
    /* 
      Since we are outside of the `/docs` directory, the globally registered components aren't available
      https://docusaurus.io/docs/markdown-features/react#mdx-component-scope
    
      This means that MDX such as Admonitions:
     
      :::note
    
      Foo
    
      :::
    
      Won't render correctly, as they are compiled into React components that are not available in this scope.
      We need to wrap the content in an MDXProvider, passing in the global MDXComponents object to make them available.
     */
    <MDXProvider components={MDXComponents}>
      <Layout>
        <Box sx={{ margin: 4, mt: 3, height: '100%' }}>
          <Header title={content?.meta?.title} label={content?.meta?.label} />
          <Grid sx={{ mt: 2 }} wrap="nowrap" container item columnSpacing={4}>
            <Grid item>
              <Steps
                steps={steps}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
              ></Steps>
            </Grid>
            <Grid container item>
              <Grid item>
                <ShowTutorial content={steps[activeStep]}></ShowTutorial>
              </Grid>
              <Grid container item columnSpacing={2}>
                <Grid item>
                  {activeStep !== 0 && (
                    <PaginatorNavButton
                      subLabel="Previous"
                      title={steps[activeStep - 1]?.frontMatter.title}
                      isNext={false}
                      onClick={() => setActiveStep(activeStep - 1)}
                    />
                  )}
                </Grid>
                <Grid item>
                  {activeStep !== steps.length - 1 && (
                    <PaginatorNavButton
                      subLabel="Next"
                      title={steps[activeStep + 1]?.frontMatter.title}
                      isNext={true}
                      onClick={() => setActiveStep(activeStep + 1)}
                    />
                  )}
                </Grid>
              </Grid>
              <Grid item sx={{ mt: 2 }}>
                <Feedback />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Layout>
    </MDXProvider>
  )
}

export default TutorialItem
