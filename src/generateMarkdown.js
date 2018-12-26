/**
 * Generate markdown string from react component documentation JSON object
 */

import template from 'lodash/template';
import path from 'path';
const pkg = require(path.join(process.cwd(), 'package.json'));

// Markdown文件字符串模板
const markdownTemplate = `\
# {{ componentName }} - {{ description || '__此处请修改为组件的中文名称__' }}

{{ packageDescription || '__此处请修改为组件的详细说明信息__' }}

[**项目主页**](http://gitlab.niub.la/abc-widgets/{{ packageName || '__此处请修改为组件的项目主页地址__' }})

## 适用范围

__此处请修改为组件适用范围的详细说明信息__。下图是{{ description }}的演示截图：

![{{ description }}截图](http://gitlab.niub.la/abc-components/assets/raw/master/img/{{ packageName ? packageName + '-screenshot.jpg' : '__此处请修改为组件的截图路径__' }})

## 代码演示

\`\`\`js
import {{ componentName }} from '{{ packageName || '__此次请修改为组件的包名__' }}';

// ...

<{{ componentName }}
  // ...
/>
\`\`\`

## API

|属性|说明|类型|默认值|
|:--|:--|:--:|:--:|
{{ props }}

`;

// Markdown文件字符串模板渲染函数
const markdownRenderer = template(markdownTemplate, {
  escape: false,
  interpolate: /{{([\s\S]+?)}}/g,
});

function generatePropType(type) {
  let values;
  if (Array.isArray(type.value)) {
    values =
      '(' +
      type.value
        .map(function(typeValue) {
          return typeValue.name || typeValue.value;
        })
        .join('|') +
      ')';
  } else {
    values = type.value;
  }

  return '`' + type.name + (values || '') + '`';
}

function generateProp(propName, prop) {
  const desc = prop.description
    .replace(/\r\n|\n/g, '<br>')
    .replace(/\|/, '\|');

  return (
    '|' + propName + (prop.required ? ' (必选)' : '') + '|' +
    (desc || '') + '|'+
    (prop.type ? generatePropType(prop.type) : '') + '|' +
    (prop.defaultValue ? `\`${prop.defaultValue.value}\`` : '`undefined`') + '|'
  );
}

function generateProps(props) {
  return (
    Object.keys(props).sort().map(propName => 
      generateProp(propName, props[propName])
    ).join('\n')
  );
}

function generateMarkdown (reactAPI) {
  // 渲染Markdown文件字符串模板
  const markdownString = markdownRenderer({
    componentName: reactAPI.displayName,
    description: reactAPI.description || pkg.description,
    props: generateProps(reactAPI.props),
    packageName: pkg.name,
    packageDescription: pkg.description,
  });

  return markdownString;
}

export default generateMarkdown;
