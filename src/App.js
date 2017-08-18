import React, { Component } from 'react';
import remark from 'remark';
import unified from 'unified';
import markdown from 'remark-parse';
import toc from 'remark-toc';
import html from 'remark-html';
import remark2rehype from 'remark-rehype';
import rehype2react from 'remark-react';
import prism4rehype from 'rehype-prism';
import RemarkLowlight from 'remark-react-lowlight';
import js from 'highlight.js/lib/languages/javascript';
import github from 'remark-github';
import highlight from 'rehype-highlight';
import "prismjs/components/prism-java";
import "prismjs/components/prism-json";
import "prismjs/components/prism-go";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-sql";
import "prismjs/themes/prism.css";
import reactHighlight from 'react-highlight'
import logo from './logo.svg';
import './App.css';

import merge from 'deepmerge';
import sanitizeGhSchema from 'hast-util-sanitize/lib/github.json';
const schema = merge(sanitizeGhSchema, { attributes: { 'code': ['className'] } });

//const processor2 = unified()
//  .use(markdown)
//  .use(toc)
//  .use(github, {
//    repository: 'https://github.com/rhysd/rehype-react'
//  })
//  .use(remark2rehype)
//  .use(highlight)
//  .use(rehype2react, {
//    createElement: React.createElement
//  });
const processor2 = unified()
  .use(markdown, { gfm: true, breaks: true, yaml: false })
  .use(toc)
  .use(rehype2react, {
    sanitize: schema,
    prefix: 'md-',
    remarkReactComponents: {
      code: RemarkLowlight({
        js
      })
    }
  });

//console.log(processor2.processSync('# Hello\\n\\n## Table of Contents\\n\\n## @rhysd').contents)

processor2.process('# Hello world!', (error, file) => {
  console.log(file.contents)
});

const text = "# Hello world!\n\n```js\nvar hoge = 'hoge'\n```"

const processor = remark()
  .use(remark2rehype)
  .use(prism4rehype)
  .use(rehype2react, {
    createElement: React.createElement
  });

class Preview extends Component {
  constructor () {
    super();

    this.state = {
      preview: <div />
    }
  }

  componentWillMount () {
    this.updatePreviewState(this.props.text)
  }

  componentWillReceiveProps (nextProps) {
    this.updatePreviewState(nextProps.text)
  }

  updatePreviewState (text) {
    processor2.process(text, (error, file) => {
      if (error !== null) return;

      this.setState({ preview: file.contents})
    })
  }

  render () {
    const { preview } = this.state;
    return preview
  }
}

class App extends Component {
  constructor () {
    super();

    this.state = {
      text: text
    };
    this.onChange = this.onChange.bind(this)
  }

  onChange(e) {
    this.setState({ text: e.target.value });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <textarea
            style={{width: 500, height: 500}}
            value={this.state.text}
            onChange={this.onChange} />
          <div style={{textAlign: 'left'}}>
            <Preview text={this.state.text} />
          </div>
        </div>
        <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/default.min.css" />
      </div>
    );
  }
}

export default App;
