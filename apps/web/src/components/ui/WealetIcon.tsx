import { useId } from 'react'

interface WealetIconProps {
  size?: number
}

export function WealetIcon({ size = 32 }: WealetIconProps) {
  const uid = useId()
  const bgId = `${uid}-bg`
  const wId = `${uid}-w`
  const barId = `${uid}-bar`
  const clipId = `${uid}-clip`

  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#052B67" />
          <stop offset="0.55" stopColor="#021B49" />
          <stop offset="1" stopColor="#010F2E" />
        </linearGradient>
        <linearGradient id={wId} x1="85" y1="170" x2="425" y2="390" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#10C7D9" />
          <stop offset="0.46" stopColor="#00A99D" />
          <stop offset="1" stopColor="#8BD84A" />
        </linearGradient>
        <linearGradient id={barId} x1="165" y1="80" x2="350" y2="310" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7FDC4A" />
          <stop offset="0.55" stopColor="#00BFA6" />
          <stop offset="1" stopColor="#047B8F" />
        </linearGradient>
        <clipPath id={clipId}>
          <rect x="0" y="0" width="512" height="512" rx="102" />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="512" height="512" rx="102" fill={`url(#${bgId})`} />
      <g clipPath={`url(#${clipId})`} transform="scale(1.4222222222) translate(-150 -220)">
        <g opacity={0.96} transform="translate(335 348) scale(0.92 0.90) translate(-385.5 -355.5)">
          <path d="M304 353C304 344.716 310.716 338 319 338H348V457H304V353Z" fill={`url(#${barId})`} opacity={0.68} />
          <path d="M361 315C361 306.716 367.716 300 376 300H406V457H361V315Z" fill={`url(#${barId})`} opacity={0.86} />
          <path d="M420 269C420 260.716 426.716 254 435 254H467V457H420V269Z" fill={`url(#${barId})`} />
        </g>
        <g transform="translate(330 418) scale(0.82 0.90) translate(-398 -419)">
          <path
            d="M228 351 C220 338 224 322 238 316 C254 309 269 316 277 331 L326 423 C331 432 343 432 348 423 L381 362 C389 347 407 347 415 362 L447 422 C452 432 465 432 470 422 L518 331 C526 316 542 309 557 316 C572 323 576 340 568 354 L492 495 C478 522 439 522 425 495 L398 443 C394 436 384 436 380 443 L352 496 C338 522 300 522 286 496 L228 351Z"
            fill={`url(#${wId})`}
          />
          <path
            d="M372 441 L398 392 C402 385 411 385 415 392 L447 452 C451 460 461 462 468 457 L433 494 C430 497 426 497 423 493 L397 443 C393 436 384 436 380 443 L351 497 C348 502 342 504 337 501 L372 441Z"
            fill="#72C95A"
            opacity={0.72}
          />
        </g>
      </g>
    </svg>
  )
}
