// A JavaScript function that returns an object.
// `context` is provided by Docusaurus. Example: siteConfig can be accessed from context.

const fs = require('fs')

// `opts` is the user-defined options.
module.exports = function (context, opts) {
  return {
    // A compulsory field used as the namespace for directories to cache
    // the intermediate data for each plugin.
    // If you're writing your own local plugin, you will want it to
    // be unique in order not to potentially conflict with imported plugins.
    // A good way will be to add your own project name within.
    name: 'docusaurus-my-project-cool-plugin',

    async loadContent() {
      // The loadContent hook is executed after siteConfig and env has been loaded.
      // You can return a JavaScript object that will be passed to contentLoaded hook.
      const out = []
      fs.readdir('./tutorial', (err, files) => {
        if (err) {
          throw new Error(err)
        }

        const dirs = files.filter((file) => {
          return fs.lstatSync(`./tutorial/${file}`).isDirectory()
        })

        for (const dir of dirs) {
          // Read the files in the directory
          const files = fs.readdirSync(`./tutorial/${dir}`)
          // Place the files in the object
          let tutorial = {}
          tutorial['files'] = []
          for (const file of files) {
            if (file === 'meta.json') {
              tutorial['meta'] = JSON.parse(
                fs.readFileSync(`./tutorial/${dir}/${file}`, 'utf8')
              )
              // Set the `id` to the directory name
              tutorial['meta']['id'] = dir
            } else {
              if (!fs.lstatSync(`./tutorial/${dir}/${file}`).isDirectory()) {
                tutorial['files'].push('./' + dir + '/' + file)
              }
            }
          }
          out.push(tutorial)
        }
      })
      return out
    },

    async contentLoaded({ content, actions }) {
      // The contentLoaded hook is done after loadContent hook is done.
      // `actions` are set of functional API provided by Docusaurus (e.g. addRoute)
      const { addRoute, createData } = actions

      const contentPath = await createData(
        'tutorials.json',
        JSON.stringify(content)
      )

      addRoute({
        path: '/tutorials',
        component: '@site/src/components/tutorials/TutorialList',
        modules: {
          tutorials: contentPath,
        },
        exact: true,
      })

      for (const tutorial of content) {
        const { files, meta } = tutorial

        const content = await createData(
          `tutorial-${meta.id}.json`,
          JSON.stringify({ files, meta })
        )

        addRoute({
          path: `/tutorials/${meta.id}`,
          component: '@site/src/components/tutorials/Tutorial',
          modules: {
            content,
          },
          exact: true,
        })
      }
    },
  }
}
