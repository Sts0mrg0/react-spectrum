/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {clamp, mergeProps} from '@react-aria/utils';
import {classNames} from '@react-spectrum/utils';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import {SliderBase, SliderBaseChildArguments, SliderBaseProps} from './SliderBase';
import {SpectrumSliderProps} from '@react-types/slider';
import styles from '@adobe/spectrum-css-temp/components/slider/vars.css';
import {useHover} from '@react-aria/interactions';
import {useLocale} from '@react-aria/i18n';
import {VisuallyHidden} from '@react-aria/visually-hidden';

function Slider(props: SpectrumSliderProps, ref: FocusableRef<HTMLDivElement>) {
  let {onChange, value, defaultValue, isFilled, fillOffset, trackGradient, ...otherProps} = props;

  let baseProps: Omit<SliderBaseProps, 'children'> = {
    ...otherProps,
    count: 1,
    // Normalize `value: number[]` to `value: number`
    value: value != null ? [value] : undefined,
    defaultValue: defaultValue != null ? [defaultValue] : undefined,
    onChange(v) {
      onChange?.(v[0]);
    }
  };

  let {direction} = useLocale();
  let {isHovered, hoverProps} = useHover({});

  return (
    <SliderBase
      {...baseProps}
      ref={ref}
      classes={{
        'spectrum-Slider--filled': isFilled && fillOffset == null
      }}
      style={
        // @ts-ignore
        {'--spectrum-slider-track-color': trackGradient && `linear-gradient(to ${direction === 'ltr' ? 'right' : 'left'}, ${trackGradient.join(', ')})`}
      }>
      {({inputRefs: [inputRef], thumbProps: [thumbProps], inputProps: [inputProps], ticks, state}: SliderBaseChildArguments) => {
        fillOffset = fillOffset != null ? clamp(fillOffset, state.getThumbMinValue(0), state.getThumbMaxValue(0)) : fillOffset;

        let cssDirection = direction === 'rtl' ? 'right' : 'left';

        let lowerTrack = (
          <div
            className={classNames(styles, 'spectrum-Slider-track')}
            style={{
              width: `${state.getThumbPercent(0) * 100}%`,
              // TODO not sure if it has advantages, but this could also be implemented as CSS calc():
              // .track::before {
              //    background-size: calc((1/ (var(--width)/100)) * 100%);
              //    width: calc(var(--width) * 1%)M
              // }
              // @ts-ignore
              '--spectrum-track-background-size': `${(1 / state.getThumbPercent(0)) * 100}%`,
              '--spectrum-track-background-position': direction === 'ltr' ? '0' : '100%'
            }} />
        );
        let upperTrack = (
          <div
            className={classNames(styles, 'spectrum-Slider-track')}
            style={{
              width: `${(1 - state.getThumbPercent(0)) * 100}%`,
              // @ts-ignore
              '--spectrum-track-background-size': `${(1 / (1 - state.getThumbPercent(0))) * 100}%`,
              '--spectrum-track-background-position': direction === 'ltr' ? '100%' : '0'
            }} />
        );

        let handle = (
          <div
            className={classNames(styles, 'spectrum-Slider-handle', {'is-hovered': isHovered, 'is-dragged': state.isThumbDragging(0)})}
            style={{
              [cssDirection]: `${state.getThumbPercent(0) * 100}%`
            }}
            {...mergeProps(thumbProps, hoverProps)}
            role="presentation">
            <VisuallyHidden>
              <input className={classNames(styles, 'spectrum-Slider-input')} ref={inputRef} {...inputProps} />
            </VisuallyHidden>
          </div>
        );

        let filledTrack = null;
        if (isFilled && fillOffset != null) {
          let width = state.getThumbPercent(0) - state.getValuePercent(fillOffset);
          let isRightOfOffset = width > 0;
          let offset = isRightOfOffset ? state.getValuePercent(fillOffset) : state.getThumbPercent(0);
          filledTrack = (
            <div
              className={classNames(styles, 'spectrum-Slider-fill', {'spectrum-Slider-fill--right': isRightOfOffset})}
              style={{
                [cssDirection]: `${offset * 100}%`,
                width: `${Math.abs(width) * 100}%`
              }} />
          );
        }
        return  (
          <>
            {lowerTrack}
            {ticks}
            <FocusRing within focusRingClass={classNames(styles, 'is-focused')}>
              {handle}
            </FocusRing>
            {upperTrack}
            {filledTrack}
          </>
        );
      }}
    </SliderBase>
  );
}

const _Slider = React.forwardRef(Slider);
export {_Slider as Slider};
