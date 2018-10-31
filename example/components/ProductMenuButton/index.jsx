/**
 * @description 产品菜单按钮组件
 * @author jhqu
 * date: 2018-06-07
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { Popover, List } from 'antd';
import './style.scss';

// 组件BEM基础类（Block）
const blockClass = 'product-menu-button';

// 产品菜单按钮组件
export default class ProductMenuButton extends Component {
  // 默认属性
  static defaultProps = {
    // 是否显示加载指示器
    // true: 显示
    // false: 不显示
    loading: false,

    // 菜单标题文本
    title: '全部产品',

    // 用户信息数据
    userInfo: {},

    // 产品菜单弹出层的显示位置，默认显示在下方右对齐
    popoverPlacement: 'bottomRight',
  }

  // 属性类型
  static propTypes = {
    /**
     * 是否显示加载指示器
     * true: 显示
     * false: 不显示
     */
    loading: PropTypes.bool,

    // 菜单标题文本
    title: PropTypes.string,

    // 用户信息数据
    userInfo: PropTypes.object,

    // 产品菜单弹出层的显示位置，默认显示在下方右对齐
    popoverPlacement: PropTypes.string,

    // 无默认值的测试字段
    nonDefaultValueProp: PropTypes.object.isRequired,
  }

  // 获取产品菜单列表数据
  getProductMenuItems = () => {
    let { loading, userInfo } = this.props;
    userInfo = userInfo || {};
    let { opmenu, permission } = userInfo;

    // 正在加载或数据异常时返回空列表
    if (
      loading
      || isEmpty(opmenu)
      || isEmpty(opmenu.opMenu)
      || isEmpty(permission)
      || isEmpty(permission.showItmes)
    ) {
      return [];
    }

    // 根据全量菜单列表与权限菜单列表计算出当前要显示的菜单列表项
    let menuItems = opmenu.opMenu.filter(
      item => permission.showItmes.includes(item.permission)
    );

    return menuItems;
  }

  // 渲染产品菜单
  renderProductMenu () {
    const productMenuItems = this.getProductMenuItems();

    return (
      <List
        grid={{gutter: 10, column: 3}}
        loading={this.props.loading}
        dataSource={productMenuItems}
        renderItem={item => (
          <List.Item key={item.id}>
            <div className={`${blockClass}__menu-item`}>
              <a href={item.url}>
                <img className={`${blockClass}__menu-item-icon`} src={item.icon} alt={item.title} />
                <div className={`${blockClass}__menu-item-title`}>{item.title}</div>
              </a>                          
            </div>
          </List.Item>
        )}
      />
    );
  }

  render () {
    const { title, popoverPlacement } = this.props;

    // 产品菜单
    const productMenu = this.renderProductMenu();

    return (
      <Popover
        overlayClassName={`${blockClass}__popover`}
        title={title}
        content={productMenu}
        trigger="click"
        placement={popoverPlacement}
        arrowPointAtCenter
        getPopupContainer={triggerNode => triggerNode}
      >
        <button
          className={classNames(blockClass, this.props.className)}
          style={this.props.style}
          title={title}
        >
        </button>
      </Popover>
    );
  }
}
