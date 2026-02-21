# Version Matrix

[![CI](https://github.com/lbajsarowicz/action-version-matrix/actions/workflows/ci.yml/badge.svg)](https://github.com/lbajsarowicz/action-version-matrix/actions/workflows/ci.yml)
[![Release](https://github.com/lbajsarowicz/action-version-matrix/actions/workflows/release.yml/badge.svg)](https://github.com/lbajsarowicz/action-version-matrix/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Generate Magento/Adobe Commerce CI matrix from the [magento.watch](https://magento.watch) API.

This GitHub Action fetches currently supported versions and their system requirements (PHP, MySQL, Elasticsearch, Redis, etc.) and outputs a ready-to-use `strategy.matrix` JSON — so your CI always tests against the right combinations without manual maintenance.

## Features

- Fetches live data from [magento.watch API](https://magento.watch)
- Supports **Magento Open Source**, **Adobe Commerce**, and **Mage-OS** distributions
- Three filtering modes: `latest` (one per minor line), `all`, or `custom`
- Outputs a complete matrix including PHP, database, search, cache, and web server versions

## Usage

### Latest patch per minor line (default)

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix: ${{ fromJson(needs.matrix.outputs.matrix) }}
    steps:
      - run: echo "Testing Magento ${{ matrix.magento }} with PHP ${{ matrix.php }}"

  matrix:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.matrix.outputs.matrix }}
    steps:
      - uses: lbajsarowicz/action-version-matrix@v1
        id: matrix
```

### All supported versions

```yaml
- uses: lbajsarowicz/action-version-matrix@v1
  id: matrix
  with:
    kind: all
```

### Custom versions

```yaml
- uses: lbajsarowicz/action-version-matrix@v1
  id: matrix
  with:
    kind: custom
    custom_versions: '2.4.7-p4,2.4.8'
```

### Adobe Commerce

```yaml
- uses: lbajsarowicz/action-version-matrix@v1
  id: matrix
  with:
    distribution: magento-commerce
```

## Inputs

| Input | Description | Default |
|---|---|---|
| `distribution` | API distribution: `magento-community`, `magento-commerce`, `mage-os` | `magento-community` |
| `kind` | `latest` = latest patch per minor, `all` = every supported patch, `custom` = user-specified | `latest` |
| `custom_versions` | Comma-separated versions (only when `kind: custom`) | `''` |

## Outputs

| Output | Description |
|---|---|
| `matrix` | JSON string for `strategy.matrix: ${{ fromJson(...) }}` |

### Matrix format

Each entry in `matrix.include` contains:

```json
{
  "magento": "2.4.7-p4",
  "php": "8.3",
  "composer": "2",
  "mysql": "8.0",
  "mariadb": "10.6",
  "elasticsearch": "8.11",
  "opensearch": "2.12",
  "redis": "7.2",
  "valkey": "8.0",
  "rabbitmq": "3.13",
  "varnish": "7.5",
  "nginx": "1.26"
}
```

## Versioning

This action follows [semantic versioning](https://semver.org/). Use the major version tag for stability:

```yaml
- uses: lbajsarowicz/action-version-matrix@v1  # recommended
- uses: lbajsarowicz/action-version-matrix@v1.2.0  # pin exact version
```

## License

[MIT](LICENSE)
