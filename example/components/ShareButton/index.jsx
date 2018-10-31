/**
 * @description 分享按钮组件
 * @author jhqu
 * date: 2018-08-06
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Clipboard from 'clipboard';
import QRCode from 'qrcode.react';
import isFunction from 'lodash/isFunction';
import { Button, Tooltip, Popover } from 'antd';
import './style.scss';

// 组件BEM基础类（Block）
const blockClass = 'share-button';

// 分享按钮弹出层内容子组件
class PopoverContent extends Component {
  // 默认属性
  static defaultProps = {
    // 要分享的链接，默认为当前页面的链接
    shareLink: window.location.href,

    // 弹出层容器的显示状态
    popoverVisible: false,

    // 分享链接的标题文本
    shareLinkTitle: '分享链接',

    // 复制链接按钮显示的文本
    copyButtonText: '复制链接',

    // 复制成功时的提示消息
    copySuccessMessage: '复制成功',

    // 复制出错时的提示消息
    copyErrorMessage: '复制失败，请手动复制',

    // 二维码的描述文本
    qrcodeDescription: '扫描二维码 分享到微信',
  }

  // 属性类型
  static propTypes = {
    // 要分享的链接，默认为当前页面的链接
    shareLink: PropTypes.string,

    // 弹出层容器的显示状态
    popoverVisible: PropTypes.bool,

    // 分享链接的标题文本
    shareLinkTitle: PropTypes.string,

    // 复制链接按钮显示的文本
    copyButtonText: PropTypes.string,

    // 复制成功时的提示消息
    copySuccessMessage: PropTypes.string,

    // 复制出错时的提示消息
    copyErrorMessage: PropTypes.string,

    // 二维码的描述文本
    qrcodeDescription: PropTypes.string,

    // 复制成功时的事件回调，回调函数唯一传入参数为clipboard扩展后的event对象
    // 当回调函数返回值为false时将阻止默认的复制成功提示消息
    // 参考链接：https://clipboardjs.com/#events
    onCopySuccess: PropTypes.func,

    // 复制出错时的事件回调，回调函数唯一传入参数为clipboard扩展后的event对象
    // 当回调函数返回值为false时将阻止默认的复制出错提示消息
    // 参考链接：https://clipboardjs.com/#events
    onCopyError: PropTypes.func,
  }

  // 分享链接输入框引用
  linkInput = React.createRef();

  // 复制链接按钮引用
  copyButton = React.createRef();

  // 定时器ID，用于延时隐藏复制提示的定时器
  timerId = null;

  // 相关状态
  state = {
    // 复制操作状态
    copyActionState: 'success',

    // 是否显示复制操作提示消息
    showCopyMessage: false,
  }

  // 显示复制成功提示消息
  handleCopySuccess = (e) => {
    const { onCopySuccess } = this.props;

    // 如果存在复制成功事件回调函数，且其返回值为false，则终止后续默认处理
    if (isFunction(onCopySuccess) && onCopySuccess(e) === false) {
      return;
    }

    this.setState({
      copyActionState: 'success',
      showCopyMessage: true,
    }, this.delayHideCopyMessage);
  }

  // 显示复制出错提示消息
  handleCopyError = (e) => {
    const { onCopyError } = this.props;

    // 如果存在复制出错事件回调函数，且其返回值为false，则终止后续默认处理
    if (isFunction(onCopyError) && onCopyError(e) === false) {
      return;
    }

    // 选中分享链接
    this.linkInput.current && this.linkInput.current.select();

    this.setState({
      copyActionState: 'error',
      showCopyMessage: true,
    }, this.delayHideCopyMessage);
  }

  // 延时隐藏复制操作提示消息
  delayHideCopyMessage = () => {
    // 清除上个定时器
    this.timerId && clearTimeout(this.timerId);

    // 延时隐藏
    this.timerId = setTimeout(() => this.setState({
      showCopyMessage: false,
    }), 3000);
  }

  // 立即隐藏复制操作提示消息
  hideCopyMessage = () => {
    // 清除定时器
    this.timerId && clearTimeout(this.timerId);

    this.setState({
      showCopyMessage: false,
    });
  }

  componentDidMount () {
    this.clipboard = new Clipboard(
      this.copyButton.current, {
        text: () => this.props.shareLink
      }
    );

    // 复制成功
    this.clipboard.on('success', this.handleCopySuccess);

    // 复制出错
    this.clipboard.on('error', this.handleCopyError);
  }

  componentDidUpdate (prevProps) {
    // 当弹出层容器隐藏时隐藏复制操作提示消息
    prevProps.popoverVisible !== this.props.popoverVisible
      && this.props.popoverVisible === false
      && this.hideCopyMessage();
  }

  componentWillUnmount () {
    // 清除定时器及销毁剪贴板实例对象
    this.timerId && clearTimeout(this.timerId);
    this.clipboard.destroy();
  }

  // 渲染分享按钮弹出层内容
  render () {
    const {
      shareLink,
      shareLinkTitle,
      copyButtonText,
      copySuccessMessage,
      copyErrorMessage,
      qrcodeDescription,
    } = this.props;
    const { copyActionState, showCopyMessage } = this.state;
    const copyMessage = copyActionState === 'success'
      ? copySuccessMessage
      : copyErrorMessage;

    return (
      <div className={`${blockClass}__popover-inner-wrapper`}>
        <div className={`${blockClass}__popover-share-content`}>
          <div className={`${blockClass}__popover-share-title`}>
            {shareLinkTitle}
          </div>
          <input
            className={`${blockClass}__popover-share-url-box`}
            type="url"
            readOnly
            value={shareLink}
            title={shareLink}
            ref={this.linkInput}
          />
          <Tooltip
            overlayClassName={`${blockClass}__popover-copy-tooltip`}
            placement="bottom"
            title={copyMessage}
            visible={showCopyMessage}
          >
            <button
              className={`${blockClass}__popover-share-copy-button`}
              ref={this.copyButton}
            >
              {copyButtonText}
            </button>
          </Tooltip>
        </div>
        <div className={`${blockClass}__popover-share-qrcode`}>
          <div className={`${blockClass}__popover-qrcode-box`}>
            <QRCode
              size={90}
              value={shareLink}
            />
          </div>
          <p className={`${blockClass}__popover-qrcode-description`}>
            {qrcodeDescription}
          </p>
        </div>
      </div>
    );
  }
}

// 分享按钮组件
export default class ShareButton extends Component {
  // 默认属性
  static defaultProps = {
    // 要分享的链接，默认为当前页面的链接
    shareLink: window.location.href,

    // 分享按钮显示的图标，目前仅支持antd自带图标
    buttonIcon: 'share-alt',
    
    // 分享按钮显示的文本
    buttonText: '分享',

    // 分享弹出层的显示位置，默认显示在下方右对齐（相对分享按钮）
    popoverPlacement: 'bottomRight',

    // 分享链接的标题文本
    shareLinkTitle: '分享链接',

    // 复制链接按钮显示的文本
    copyButtonText: '复制链接',

    // 复制成功时的提示消息
    copySuccessMessage: '复制成功',

    // 复制出错时的提示消息
    copyErrorMessage: '复制失败，请手动复制',

    // 二维码的描述文本
    qrcodeDescription: '扫描二维码 分享到微信',
  }

  // 属性类型
  static propTypes = {
    // 要分享的链接，默认为当前页面的链接
    shareLink: PropTypes.string,

    // 分享按钮显示的图标，目前仅支持antd自带图标
    buttonIcon: PropTypes.string,
    
    // 分享按钮显示的文本
    buttonText: PropTypes.string,

    // 分享弹出层的显示位置，默认显示在下方右对齐（相对分享按钮）
    popoverPlacement: PropTypes.string,

    // 分享链接的标题文本
    shareLinkTitle: PropTypes.string,

    // 复制链接按钮显示的文本
    copyButtonText: PropTypes.string,

    // 复制成功时的提示消息
    copySuccessMessage: PropTypes.string,

    // 复制出错时的提示消息
    copyErrorMessage: PropTypes.string,

    // 二维码的描述文本
    qrcodeDescription: PropTypes.string,

    // 自定义的分享按钮
    children: PropTypes.node,
  }

  // 分享弹出层内容子组件
  static PopoverContent = PopoverContent;

  // 相关状态
  state = {
    // 分享弹出层显示状态
    popoverVisible: false,
  }

  // 分享弹出层显示状态发生改变
  handleVisibleChange = (visible) => {
    this.setState({popoverVisible: visible});
  }

  render () {
    const {
      style,
      children,
      className,
      buttonIcon,
      buttonText,
      popoverPlacement,
      ...restProps
    } = this.props;
    const { popoverVisible } = this.state;
    
    return (
      <Popover
        overlayClassName={`${blockClass}__popover`}
        title={null}
        content={
          <PopoverContent
            {...restProps}
            popoverVisible={popoverVisible}
          />
        }
        trigger="click"
        placement={popoverPlacement}
        visible={popoverVisible}
        onVisibleChange={this.handleVisibleChange}
        getPopupContainer={triggerNode => triggerNode}
      >
        {children ||
          <Button
            icon={buttonIcon}
            className={classNames(blockClass, className)}
            style={style}
          >
            {buttonText}
          </Button>
        }
      </Popover>
    );
  }
}
