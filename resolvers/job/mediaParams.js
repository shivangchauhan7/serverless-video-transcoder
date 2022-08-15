module.exports = {
  Settings: {
    TimecodeConfig: {
      Source: 'ZEROBASED'
    },
    OutputGroups: [
      {
        Name: 'Apple HLS',
        Outputs: [
          {
            ContainerSettings: {
              Container: 'M3U8',
              M3u8Settings: {}
            },
            VideoDescription: {
              Width: '',
              Height: '',
              CodecSettings: {
                Codec: 'H_264',
                H264Settings: {
                  MaxBitrate: '',
                  RateControlMode: 'QVBR',
                  SceneChangeDetect: 'TRANSITION_DETECTION'
                }
              }
            },
            AudioDescriptions: [
              {
                CodecSettings: {
                  Codec: 'AAC',
                  AacSettings: {
                    Bitrate: 96000,
                    CodingMode: 'CODING_MODE_2_0',
                    SampleRate: 48000
                  }
                }
              }
            ],
            OutputSettings: {
              HlsSettings: {}
            },
            NameModifier: 'hgh'
          }
        ],
        OutputGroupSettings: {
          Type: 'HLS_GROUP_SETTINGS',
          HlsGroupSettings: {
            SegmentLength: 10,
            MinSegmentLength: 0,
            DestinationSettings: {
              S3Settings: {
                AccessControl: {
                  CannedAcl: 'PUBLIC_READ'
                }
              }
            }
          }
        }
      },
      {
        CustomName: 'Thumbnail Creation Group',
        Name: 'File Group',
        Outputs: [
          {
            ContainerSettings: {
              Container: 'RAW'
            },
            VideoDescription: {
              Width: 1280,
              Height: 720,
              CodecSettings: {
                Codec: 'FRAME_CAPTURE',
                FrameCaptureSettings: {
                  FramerateNumerator: 1,
                  FramerateDenominator: 5,
                  MaxCaptures: 5,
                  Quality: 80
                }
              }
            }
          }
        ],
        OutputGroupSettings: {
          Type: 'FILE_GROUP_SETTINGS',
          FileGroupSettings: {
            DestinationSettings: {
              S3Settings: {
                AccessControl: {
                  CannedAcl: 'PUBLIC_READ'
                }
              }
            }
          }
        }
      }
    ],
    Inputs: [
      {
        AudioSelectors: {
          'Audio Selector 1': {
            DefaultSelection: 'DEFAULT'
          }
        },
        VideoSelector: {},
        TimecodeSource: 'ZEROBASED'
      }
    ]
  },
  AccelerationSettings: {
    Mode: 'DISABLED'
  },
  StatusUpdateInterval: 'SECONDS_60',
  Priority: 0
}
