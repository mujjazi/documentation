import React from 'react'
import { useHistory } from '@docusaurus/router'
import Layout from '@theme/Layout'

import {
  Box,
  FormControl,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
  Grid,
} from '@mui/material'
import { grey } from '@mui/material/colors'
import { ChevronRight, Search } from '@mui/icons-material'

import {
  Card,
  Title,
  Topic,
  Description,
  StartButton,
  shadow,
} from './styledComponents'
import { Tutorial, Meta, Topic as TopicType, Step } from '../models'
import { Grid as TutorialGrid } from './styledComponents'
import { stepToHistory } from '../Steps'

function TutorialCard({ tutorial }: { tutorial: Tutorial }) {
  const history = useHistory()

  return (
    <Card>
      <Grid
        sx={{ height: '100%' }}
        container
        direction="column"
        justifyContent="space-between"
      >
        <Grid item container direction="column">
          <Grid item>
            <Title>{tutorial.meta.title}</Title>
          </Grid>
          <Grid item>
            <Topic label={tutorial.meta.label} sx={{ mb: 2 }}></Topic>
          </Grid>
          <Grid item>
            <Description>{tutorial.meta.description}</Description>
          </Grid>
        </Grid>
        <Grid item>
          <StartButton
            onClick={() => {
              const steps = getSteps(tutorial.meta.id)
              const first = steps[0]
              history.push(stepToHistory(first))
            }}
            endIcon={<ChevronRight />}
          >
            Start Learning
          </StartButton>
        </Grid>
      </Grid>
    </Card>
  )
}

function Header() {
  return (
    <Box>
      <Typography fontWeight={500} variant="h4" component="h2" sx={{ mb: 1 }}>
        Tutorials & Guides
      </Typography>

      <p>
        Step-by-step instructions and expert tips to help you master new skills
        and navigate through complex tasks.
      </p>
    </Box>
  )
}

function searchFilter(term: string, tutorial?: Tutorial): boolean {
  return tutorial
    ? tutorial?.meta.title.toLowerCase().includes(term.toLowerCase())
    : false
}

function topicFilter(topic: TopicDropdown, tutorial?: Tutorial): boolean {
  if (!tutorial) return false
  if (topic === 'All topics') return true
  return tutorial ? tutorial?.meta.label === topic : false
}

type TopicDropdown = keyof typeof TopicType.Values | 'All topics'
const TopicDropdownValues: TopicDropdown[] = [
  'All topics',
  ...Object.values(TopicType.Values),
]

function getSteps(id: string): Step[] {
  const context = require.context('@site/tutorials/', true)

  // Filter to ones that are in the `tutorialname` dir
  const steps = context
    .keys()
    .filter((key) => key.includes(id) && key.endsWith('md'))
    .map((key) => [key, context(key)])
    .map(([path, mdFile]) => Step.parse({ ...mdFile.frontMatter, path }))

  steps.sort((a, b) => a.position - b.position)

  return steps
}

function TutorialList({
  tutorials,
}: {
  tutorials: Record<string, Record<string, unknown>>
}) {
  const [search, setSearch] = React.useState('')
  const [topic, setTopic] = React.useState<TopicDropdown>('All topics')
  const [parsedTutorials, setParsedTutorials] = React.useState<Tutorial[]>([])

  React.useEffect(() => {
    setParsedTutorials(
      Object.values(tutorials).map((data) => {
        data.files = getSteps(data.meta.id)
        const parsedTutorials = Tutorial.parse(data)

        // Ensure no duplicate positions
        const duplicates = new Set<number>()
        for (const step of parsedTutorials.files) {
          if (duplicates.has(step.position)) {
            throw new Error(
              `Duplicate step position ${step.position} in tutorial "${parsedTutorials.meta.id}"` +
                `\nCheck steps: \n${parsedTutorials.files
                  .filter((s) => s.position === step.position)
                  .map((s) => s.path)
                  .join('\n')}\n`
            )
          }
          duplicates.add(step.position)
        }

        return parsedTutorials
      })
    )
  }, [tutorials])

  return (
    <Layout>
      <Box paddingX={5} paddingY={4}>
        <Header />
        <Grid container columnSpacing={2}>
          <Grid item>
            <FormControl
              variant="outlined"
              sx={{
                width: '22rem',
                mb: 4,
              }}
            >
              <OutlinedInput
                sx={{
                  backgroundColor: 'white',
                  color: grey[800],
                  boxShadow: shadow,
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <Search
                      sx={{
                        color: 'rgba(102, 56, 184, 1)',
                      }}
                    />
                  </InputAdornment>
                }
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name of the tutorial or guide..."
              />
            </FormControl>
          </Grid>

          {/* Dropdown for filtering by topic */}
          <Grid item>
            <FormControl
              variant="outlined"
              sx={{
                border: grey[300],
                boxShadow: shadow,
                width: '12rem',
                mb: 4,
                transformOrigin: 'top',
                // Dropdowns are very slightly bigger than the search bar, so scale down
                transform: 'scale(0.95)',
              }}
            >
              <Select
                sx={{
                  backgroundColor: 'white',
                  color: grey[800],
                }}
                value={topic}
                onChange={(e) => setTopic(e.target.value as TopicDropdown)}
              >
                {TopicDropdownValues.map((topic) => (
                  <MenuItem key={topic} value={topic}>
                    {topic}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TutorialGrid mb={2}>
          {parsedTutorials
            .filter((tutorial: Tutorial) => searchFilter(search, tutorial))
            .filter((tutorial: Tutorial) => topicFilter(topic, tutorial))
            .map((tutorial: Tutorial) => (
              <TutorialCard key={tutorial.meta.id} tutorial={tutorial} />
            ))}
        </TutorialGrid>
      </Box>
    </Layout>
  )
}

export default TutorialList
